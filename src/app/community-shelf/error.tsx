"use client";

import { RouteError } from "@/components/student2-RouteError";

/**
 * /community-shelf render'ı sırasında beklenmedik bir hata çıkarsa gösterilir.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */
export default function CommunityShelfError({
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
      title="Couldn't load Community Shelf"
      description="Something unexpected went wrong loading the Community Shelf requests."
      backHref="/browse"
      backLabel="Back to Browse"
    />
  );
}
