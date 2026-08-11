import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { SetupNotice } from "@/components/SetupNotice";
import { BROWSABLE_STATUSES } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { shelfCutoffDate } from "@/lib/student2-shelf";
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
  description: "Search lost and found items across campus.",
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

  // Community Shelf: 30+ gündür claim'lenmemiş "found" ilanlar.
  if (filters.shelf) {
    query = query.eq("type", "found").lte("item_date", shelfCutoffDate());
  } else if (filters.type) {
    query = query.eq("type", filters.type);
  }
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
        description="Lost and found items across campus."
        action={<ButtonLink href="/report">Report Item</ButtonLink>}
      />

      <BrowseFilters filters={filters} />

      {error ? (
        <FormError>
          Couldn&apos;t load listings: {error.message}
        </FormError>
      ) : items.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters(filters)
              ? "No listings match this search"
              : "No listings yet"
          }
          description={
            hasActiveFilters(filters)
              ? "Try loosening your filters."
              : "Be the first to post one."
          }
          action={
            hasActiveFilters(filters) ? (
              <ButtonLink href="/browse" variant="secondary">
                Clear filters
              </ButtonLink>
            ) : (
              <ButtonLink href="/report">Report Item</ButtonLink>
            )
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            {items.length} {items.length === 1 ? "listing" : "listings"}
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
