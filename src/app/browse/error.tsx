"use client";

import { RouteError } from "@/components/student2-RouteError";

/**
 * /browse render'ı sırasında beklenmedik bir hata çıkarsa gösterilir.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * page.tsx Supabase'in döndürdüğü sorgu hatasını zaten kendi içinde
 * yakalıyor; buraya düşen durumlar daha aşağıdaki katmandan geliyor
 * (ör. bağlantı kopması, render sırasında atılan hata).
 */
export default function BrowseError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError
      error={error}
      retry={retry}
      title="Couldn't load listings"
      description="Something unexpected went wrong. Check your connection and try again."
      backHref="/"
      backLabel="Back to home"
    />
  );
}
