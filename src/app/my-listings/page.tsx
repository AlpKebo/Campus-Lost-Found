import { redirect } from "next/navigation";

import { ListingCard } from "@/app/my-listings/ListingCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import type { ReceivedClaim } from "@/types/database";

/**
 * My Listings — brief bölüm 6.
 *
 * Kullanıcı yalnızca kendi oluşturduğu listing'leri görür. owner_id filtresi
 * hem burada hem RLS'te var: RLS'teki items_select_public policy'si başkasının
 * open/claimed item'larını da okutur, o yüzden bu sayfada filtre şart.
 *
 * SAHİBİ: student1.
 */
export default async function MyListingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent("/my-listings")}`);
  }

  if (!profile.name) {
    redirect(`/profile-setup?next=${encodeURIComponent("/my-listings")}`);
  }

  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  // Gelen claim'ler (brief bölüm 9): ayrı bir sayfa değil, My Listings
  // içinde gösterilir. received_claims() tek çağrıda owner'ın bütün
  // item'larına gelen claim'leri döner — item başına sorgu atmaya gerek yok.
  //
  // Bu fonksiyon claimant'in emailini yalnızca claim accepted ise doldurur;
  // pending claim'de email sızmaması DB seviyesinde garanti.
  const { data: claims, error: claimsError } = await supabase.rpc(
    "received_claims",
    { p_item_id: null },
  );

  const claimsByItem = new Map<string, ReceivedClaim[]>();
  for (const claim of claims ?? []) {
    const existing = claimsByItem.get(claim.item_id);
    if (existing) {
      existing.push(claim);
    } else {
      claimsByItem.set(claim.item_id, [claim]);
    }
  }

  return (
    <div className="py-6">
      <PageHeader
        title="My Listings"
        description="Yayınladığın ilanlar ve durumları."
        action={<ButtonLink href="/report">Report Item</ButtonLink>}
      />

      <div className="mb-4 space-y-3 empty:mb-0">
        {error && <FormError>İlanların yüklenemedi: {error.message}</FormError>}
        {/* Claim'ler gelmezse ilanlar yine listelenir; sadece bu bölüm eksik
            kalır. En olası sebep: student1_accept_claim.sql / schema.sql
            henüz çalıştırılmamış. */}
        {claimsError && (
          <FormError>
            Gelen claim&apos;ler yüklenemedi: {claimsError.message}
          </FormError>
        )}
      </div>

      {!error && items && items.length === 0 && (
        <EmptyState
          title="Henüz ilanın yok"
          description="Kaybettiğin veya bulduğun bir eşyayı bildirdiğinde burada görünecek."
          action={<ButtonLink href="/report">Report Item</ButtonLink>}
        />
      )}

      {items && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              claims={claimsByItem.get(item.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
