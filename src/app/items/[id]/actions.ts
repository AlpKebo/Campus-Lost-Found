"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  type ClaimFormState,
} from "./claim-contract";

/**
 * Claim gönderme server action'ı.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * Asıl kurallar RLS'te (claims_insert_own): yalnızca kendi adına, yalnızca
 * type='found' + status='open' item'lara, kendi ilanına değil. Buradaki
 * kontroller kullanıcıya anlamlı mesaj göstermek için — güvenlik database'de.
 *
 * Bu dosya yalnızca async fonksiyon export edebilir; sabitler ve tip
 * claim-contract.ts içinde duruyor.
 */
export async function submitClaim(
  itemId: string,
  _prevState: ClaimFormState,
  formData: FormData,
): Promise<ClaimFormState> {
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < MESSAGE_MIN) {
    return {
      status: "error",
      message: `Mesajın en az ${MESSAGE_MIN} karakter olmalı.`,
    };
  }

  if (message.length > MESSAGE_MAX) {
    return {
      status: "error",
      message: `Mesajın en fazla ${MESSAGE_MAX} karakter olabilir.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Claim göndermek için giriş yapmalısın.",
    };
  }

  const { error } = await supabase.from("claims").insert({
    item_id: itemId,
    claimant_id: user.id,
    message,
  });

  if (error) {
    // 23505: unique (item_id, claimant_id) — aynı ilana ikinci claim.
    if (error.code === "23505") {
      return {
        status: "error",
        message: "Bu ilana zaten bir claim göndermişsin.",
      };
    }

    // RLS reddi: ilan artık open değil, found değil, ya da senin ilanın.
    if (error.code === "42501") {
      return {
        status: "error",
        message:
          "Bu ilana claim gönderilemiyor. İlan kapanmış olabilir; sayfayı yenile.",
      };
    }

    return { status: "error", message: `Claim gönderilemedi: ${error.message}` };
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/sent-claims");

  return {
    status: "success",
    message:
      "Claim gönderildi. İlan sahibi onaylarsa iletişim bilgileri Sent Claims sayfanda görünecek.",
  };
}
