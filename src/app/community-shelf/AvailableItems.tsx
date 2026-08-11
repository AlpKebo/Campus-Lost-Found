import { ItemCard } from "@/app/browse/ItemCard";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import {
  ItemCardSkeleton,
  LoadingRegion,
  Skeleton,
} from "@/components/student2-Skeleton";
import { SHELF_DAYS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { shelfCutoffDate } from "@/lib/student2-shelf";
import type { Item } from "@/types/database";

/**
 * Community Shelf'in "şu an başvurulabilir" bölümü.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * NEDEN VAR: Sayfa yalnızca gelen/gönderilen başvuruları listeliyordu, yani
 * kullanıcı başvurabileceği ürünü görmek için Browse'a gidip kartlardaki
 * rozeti fark etmek zorundaydı. Rafın asıl amacı keşif; o yüzden uygun
 * ürünler sayfanın en üstünde duruyor.
 *
 * Sorgu Browse'un shelf filtresiyle aynı: found + open + item_date
 * SHELF_DAYS gün ya da daha eski (bkz. shelfCutoffDate).
 *
 * Listeden çıkarılanlar:
 *   - kendi ilanların — kendi eşyana başvuramazsın
 *   - zaten başvurduğun ilanlar — onlar aşağıdaki "Sent" bölümünde
 *
 * ÇIKARILMAYAN: üzerinde aktif claim olan ilanlar. claims tablosu RLS ile
 * kapalı, başkasının ilanına gelen claim'leri buradan göremeyiz. Asıl kural
 * zaten donation_requests_insert_own policy'sinde; o nadir durumda kullanıcı
 * "Request" gönderince dostane bir hata alıyor. Aynı gerekçe için bkz.
 * src/lib/student2-shelf.ts.
 */

/** Kaç kart gösterilecek — fazlası için Browse'un shelf filtresine gidilir. */
const PREVIEW_LIMIT = 8;

export async function AvailableItems() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("items")
    .select("*")
    .eq("type", "found")
    .eq("status", "open")
    .lte("item_date", shelfCutoffDate())
    // En uzun süredir bekleyen önce: rafa asıl düşmesi gerekenler yukarıda.
    .order("item_date", { ascending: true })
    .limit(PREVIEW_LIMIT + 1);

  if (user) query = query.neq("owner_id", user.id);

  const [{ data, error }, { data: myRequests }] = await Promise.all([
    query,
    user
      ? supabase
          .from("donation_requests")
          .select("item_id")
          .eq("requester_id", user.id)
      : Promise.resolve({ data: [] as { item_id: string }[] }),
  ]);

  if (error) {
    return (
      <FormError>Couldn&apos;t load available items: {error.message}</FormError>
    );
  }

  const requested = new Set((myRequests ?? []).map((r) => r.item_id));
  const eligible = ((data ?? []) as Item[]).filter((i) => !requested.has(i.id));

  const hasMore = eligible.length > PREVIEW_LIMIT;
  const shown = eligible.slice(0, PREVIEW_LIMIT);

  if (shown.length === 0) {
    return (
      <EmptyState
        title="Nothing on the shelf right now"
        description={`Found items sit here once they've gone ${SHELF_DAYS} days without a claim. Check back later.`}
        action={<ButtonLink href="/browse">Browse all items</ButtonLink>}
      />
    );
  }

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((item) => (
          <li key={item.id}>
            <ItemCard item={item} />
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-5">
          <ButtonLink href="/browse?shelf=1" variant="secondary" size="sm">
            See everything on the shelf
          </ButtonLink>
        </div>
      )}
    </>
  );
}

/** AvailableItems akarken görünen iskelet — page.tsx'teki Suspense fallback'i. */
export function AvailableItemsSkeleton() {
  return (
    <LoadingRegion label="Loading available items">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="mt-5 h-9 w-48" />
    </LoadingRegion>
  );
}
