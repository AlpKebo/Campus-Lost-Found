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
 * gönderir; arama kutusu Enter veya "Search" butonu bekler.
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
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Title, description or location"
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            name="type"
            defaultValue={filters.type}
            onChange={submitOnChange}
          >
            <option value="">All</option>
            {ITEM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            name="category"
            defaultValue={filters.category}
            onChange={submitOnChange}
          >
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="sort">Sort by</Label>
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

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <input
          type="checkbox"
          name="shelf"
          value="1"
          defaultChecked={filters.shelf}
          onChange={submitOnChange}
          className="size-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
        Available to adopt — found 30+ days ago, still unclaimed
      </label>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" size="sm">
          Search
        </Button>

        {hasActiveFilters(filters) && (
          <Link
            href="/browse"
            className="text-sm text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
          >
            Clear filters
          </Link>
        )}
      </div>
    </form>
  );
}
