"use client";

import { RouteError } from "@/components/student2-RouteError";

/**
 * /items/[id] render'ı sırasında beklenmedik bir hata çıkarsa gösterilir.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * İlanın bulunamaması hata değil: page.tsx notFound() çağırıyor ve
 * not-found.tsx devreye giriyor. Burası gerçek hatalar için.
 */
export default function ItemDetailError({
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
      title="İlan yüklenemedi"
      description="Bu ilan getirilirken beklenmedik bir hata oldu. Tekrar deneyebilir ya da listeye dönebilirsin."
      backHref="/browse"
      backLabel="Browse'a dön"
    />
  );
}
