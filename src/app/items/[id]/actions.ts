"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import {
  MESSAGE_MAX,
  MESSAGE_MIN,
  type ClaimFormState,
} from "./claim-contract";
import {
  DONATION_MESSAGE_MAX,
  DONATION_MESSAGE_MIN,
  type DonationRequestFormState,
} from "./donation-contract";

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
      message: `Your message must be at least ${MESSAGE_MIN} characters.`,
    };
  }

  if (message.length > MESSAGE_MAX) {
    return {
      status: "error",
      message: `Your message can be at most ${MESSAGE_MAX} characters.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You need to log in to send a claim.",
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
        message: "You have already sent a claim for this listing.",
      };
    }

    // RLS reddi: ilan artık open değil, found değil, ya da senin ilanın.
    if (error.code === "42501") {
      return {
        status: "error",
        message:
          "This listing can't accept claims. It may have been closed — refresh the page.",
      };
    }

    return { status: "error", message: `Couldn't send claim: ${error.message}` };
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/sent-claims");

  return {
    status: "success",
    message:
      "Claim sent. If the owner accepts, their contact details will appear on your Sent Claims page.",
  };
}

/**
 * Community Shelf başvurusu — bkz. supabase/community_shelf.sql.
 *
 * Asıl kurallar RLS'te (donation_requests_insert_own): sadece kendi adına,
 * sadece 30+ gündür açık "found" ilanlara, kendi ilanına değil, üzerinde
 * aktif bir claim yoksa. Buradaki kontroller kullanıcıya anlamlı mesaj
 * göstermek için — güvenlik database'de.
 */
export async function submitDonationRequest(
  itemId: string,
  _prevState: DonationRequestFormState,
  formData: FormData,
): Promise<DonationRequestFormState> {
  const message = String(formData.get("message") ?? "").trim();

  if (message.length < DONATION_MESSAGE_MIN) {
    return {
      status: "error",
      message: `Your message must be at least ${DONATION_MESSAGE_MIN} characters.`,
    };
  }

  if (message.length > DONATION_MESSAGE_MAX) {
    return {
      status: "error",
      message: `Your message can be at most ${DONATION_MESSAGE_MAX} characters.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "You need to log in to send a request.",
    };
  }

  const { error } = await supabase.from("donation_requests").insert({
    item_id: itemId,
    requester_id: user.id,
    message,
  });

  if (error) {
    // 23505: unique (item_id, requester_id) — aynı ilana ikinci başvuru.
    if (error.code === "23505") {
      return {
        status: "error",
        message: "You have already sent a request for this listing.",
      };
    }

    // RLS reddi: 30 gün dolmamış, found değil, open değil, aktif bir claim
    // var, ya da senin ilanın.
    if (error.code === "42501") {
      return {
        status: "error",
        message:
          "This listing can't accept requests right now. It may have just been claimed — refresh the page.",
      };
    }

    return { status: "error", message: `Couldn't send request: ${error.message}` };
  }

  revalidatePath(`/items/${itemId}`);
  revalidatePath("/community-shelf");

  return {
    status: "success",
    message:
      "Request sent. If the owner accepts, their contact details will appear on your Community Shelf page.",
  };
}
