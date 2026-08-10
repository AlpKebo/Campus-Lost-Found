"use client";

import Link from "next/link";
import { useRef } from "react";

import { Input, Label, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, ITEM_TYPES } from "@/lib/constants";

import {
  SORT_OPTIONS,
  hasActiveFilters,
  type BrowseFilterState,
} from "./filters";

/**
 * Browse sayfasının arama / filtre / sıralama çubuğu.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * Form GET ile kendi sayfasına gönderir, yani filtreler URL'de birikir ve
 * JavaScript kapalıyken bile çalışır. Select'ler değişince form kendini
 * gönderir; arama kutusu Enter veya "Ara" butonu bekler.
 */
export function BrowseFilters({ filters }: { filters: BrowseFilterState }) {
  const formRef = useRef<HTMLFormElement>(null);

  function submitOnChange() {
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      method="get"
      action="/browse"
      className="mb-8 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor="q">Ara</Label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Başlık, açıklama veya konum"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="type">Tür</Label>
          <Select
            id="type"
            name="type"
            defaultValue={filters.type}
            onChange={submitOnChange}
          >
            <option value="">Hepsi</option>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Kategori</Label>
          <Select
            id="category"
            name="category"
            defaultValue={filters.category}
            onChange={submitOnChange}
          >
            <option value="">Hepsi</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="sort">Sırala</Label>
          <Select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            onChange={submitOnChange}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" size="sm">
          Ara
        </Button>

        {hasActiveFilters(filters) && (
          <Link
            href="/browse"
            className="text-sm text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
          >
            Filtreleri temizle
          </Link>
        )}
      </div>
    </form>
  );
}
