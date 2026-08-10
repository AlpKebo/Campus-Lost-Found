"use client";

import { RouteError } from "@/components/student2-RouteError";

/**
 * /sent-claims render'ı sırasında beklenmedik bir hata çıkarsa gösterilir.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */
export default function SentClaimsError({
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
      title="Claim'ler yüklenemedi"
      description="Gönderdiğin claim'ler getirilirken beklenmedik bir hata oldu."
      backHref="/browse"
      backLabel="Browse'a dön"
    />
  );
}
