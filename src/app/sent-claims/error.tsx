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
      title="Couldn't load your claims"
      description="Something unexpected went wrong loading the claims you sent."
      backHref="/browse"
      backLabel="Back to Browse"
    />
  );
}
