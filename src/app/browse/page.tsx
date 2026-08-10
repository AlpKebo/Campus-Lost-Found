import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { SetupNotice } from "@/components/SetupNotice";
import { BROWSABLE_STATUSES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/types/database";

import { BrowseFilters } from "./BrowseFilters";
import { ItemCard } from "./ItemCard";
import { parseFilters, sanitizeSearch, hasActiveFilters } from "./filters";

/**
 * Browse — tüm açık ilanların aranabilir listesi.
 *
 * SAHİBİ: student2 (Discover & Claim). Public route; login gerekmez.
 *
 * Filtreler querystring'de tutulduğu için sayfa server component olarak
 * kalabiliyor: her filtre değişimi yeni bir istek, veri hep taze.
 */

export const metadata: Metadata = {
  title: "Browse — Campus Lost & Found",
  description: "Kampüste kaybolan ve bulunan eşyaları ara.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: PageProps) {
  const filters = parseFilters(await searchParams);

  if (!isSupabaseConfigured) {
    return (
      <div className="py-10">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();

  let query = supabase
    .from("items")
    .select("*")
    .in("status", BROWSABLE_STATUSES);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.category) query = query.eq("category", filters.category);

  const search = sanitizeSearch(filters.q);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  switch (filters.sort) {
    case "oldest":
      query = query.order("item_date", { ascending: true });
      break;
    case "recent":
      query = query.order("created_at", { ascending: false });
      break;
    case "title":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("item_date", { ascending: false });
  }

  // Aynı tarihli ilanlar arasında sıra değişmesin.
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  const items = (data ?? []) as Item[];

  return (
    <div className="py-10">
      <PageHeader
        title="Browse"
        description="Kampüste kaybolan ve bulunan eşyalar."
        action={<ButtonLink href="/report">Report Item</ButtonLink>}
      />

      <BrowseFilters filters={filters} />

      {error ? (
        <FormError>
          İlanlar yüklenemedi: {error.message}
        </FormError>
      ) : items.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters(filters)
              ? "Bu aramaya uyan ilan yok"
              : "Henüz ilan yok"
          }
          description={
            hasActiveFilters(filters)
              ? "Filtreleri gevşetip tekrar dene."
              : "İlk ilanı sen ekleyebilirsin."
          }
          action={
            hasActiveFilters(filters) ? (
              <ButtonLink href="/browse" variant="secondary">
                Filtreleri temizle
              </ButtonLink>
            ) : (
              <ButtonLink href="/report">Report Item</ButtonLink>
            )
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            {items.length} ilan
          </p>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
