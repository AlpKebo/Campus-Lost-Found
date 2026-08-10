import { CATEGORIES, ITEM_TYPES } from "@/lib/constants";
import type { ItemCategory, ItemType } from "@/types/database";

/**
 * Browse filtrelerinin URL'den okunması ve doğrulanması.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * Filtreler querystring'de tutulur; böylece sayfa server component olarak
 * kalır ve kullanıcı filtrelenmiş bir aramanın linkini paylaşabilir.
 */

export const SORT_OPTIONS = [
  { value: "newest", label: "Tarihe göre — yeni" },
  { value: "oldest", label: "Tarihe göre — eski" },
  { value: "recent", label: "Son eklenen" },
  { value: "title", label: "Başlığa göre (A-Z)" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "newest";

export type BrowseFilterState = {
  q: string;
  type: ItemType | "";
  category: ItemCategory | "";
  sort: SortValue;
};

/** searchParams'tan gelen ham değeri tek bir string'e indirger. */
function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * PostgREST'in `or` filtresi virgülle ayrılır ve parantez kullanır; arama
 * metnindeki bu karakterler filtreyi bozar. Ayrıca `%` ve `_` ilike joker
 * karakterleridir, aranan kelimenin parçası sayılmamalı.
 */
export function sanitizeSearch(raw: string): string {
  return raw.replace(/[,()"\\%_*]/g, " ").replace(/\s+/g, " ").trim();
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): BrowseFilterState {
  const type = first(params.type);
  const category = first(params.category);
  const sort = first(params.sort);

  return {
    q: first(params.q).trim().slice(0, 100),
    type: ITEM_TYPES.some((t) => t.value === type) ? (type as ItemType) : "",
    category: CATEGORIES.some((c) => c.value === category)
      ? (category as ItemCategory)
      : "",
    sort: SORT_OPTIONS.some((s) => s.value === sort)
      ? (sort as SortValue)
      : DEFAULT_SORT,
  };
}

/** Varsayılan dışında bir filtre seçili mi — "Filtreleri temizle" için. */
export function hasActiveFilters(filters: BrowseFilterState): boolean {
  return (
    filters.q !== "" ||
    filters.type !== "" ||
    filters.category !== "" ||
    filters.sort !== DEFAULT_SORT
  );
}
