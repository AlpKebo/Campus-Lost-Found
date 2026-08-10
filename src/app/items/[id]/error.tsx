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
      title="Couldn't load this listing"
      description="Something unexpected went wrong loading this listing. Try again, or go back to the list."
      backHref="/browse"
      backLabel="Back to Browse"
    />
  );
}
