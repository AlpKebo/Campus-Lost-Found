import { ItemCard } from "@/app/browse/ItemCard";
import { BROWSABLE_STATUSES, CATEGORY_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/types/database";

import {
  ItemCardSkeleton,
  LoadingRegion,
  Skeleton,
} from "@/components/student2-Skeleton";

/**
 * İlan detayının altındaki "olası eşleşmeler" bölümü.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * FİKİR: Aynı kategorideki KARŞIT TÜR ilanları göster. Kayıp bir ilana
 * bakan biri, o eşyanın çoktan bulunup ilan edilmiş olabileceğini görür;
 * bulunan bir ilana bakan biri de sahibinin kayıp ilanını görür. Discover
 * rolünün asıl değeri burada: kullanıcı arama yapmadan eşleşmeyi yakalıyor.
 *
 * Sorgu ana içeriği bekletmesin diye page.tsx bu bileşeni <Suspense> içinde
 * render ediyor; detay hemen geliyor, bu bölüm sonradan akıyor.
 */

const RELATED_LIMIT = 4;

export async function RelatedItems({ item }: { item: Item }) {
  const supabase = await createClient();

  const oppositeType = item.type === "lost" ? "found" : "lost";

  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("category", item.category)
    .eq("type", oppositeType)
    .in("status", BROWSABLE_STATUSES)
    .order("item_date", { ascending: false })
    .limit(RELATED_LIMIT);

  const related = (data ?? []) as Item[];

  // Eşleşme yoksa bölümü hiç açma — boş bir başlık kafa karıştırır.
  if (related.length === 0) return null;

  const category = CATEGORY_LABELS[item.category];

  return (
    <section className="mt-14 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
        {item.type === "lost"
          ? `Found ${category} listings`
          : `Lost ${category} listings`}
      </h2>

      <p className="mt-1 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        {item.type === "lost"
          ? "Someone may have found and posted it. Found items in the same category:"
          : "The owner may already be looking for it. Lost listings in the same category:"}
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {related.map((candidate) => (
          <li key={candidate.id}>
            <ItemCard item={candidate} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** RelatedItems akarken görünen iskelet — page.tsx'teki Suspense fallback'i. */
export function RelatedItemsSkeleton() {
  return (
    <section className="mt-14 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <LoadingRegion label="Loading related listings">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 mb-6 h-4 w-80 max-w-full" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: RELATED_LIMIT }, (_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </LoadingRegion>
    </section>
  );
}
