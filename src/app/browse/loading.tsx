import {
  ItemGridSkeleton,
  LoadingRegion,
  Skeleton,
} from "@/components/student2-Skeleton";

/**
 * /browse yüklenirken görünen iskelet.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * Sayfa her istekte veritabanına gidiyor; bu dosya olmadan kullanıcı filtre
 * değiştirdiğinde sorgu bitene kadar boş ekrana bakıyor.
 */
export default function BrowseLoading() {
  return (
    <div className="py-10">
      <LoadingRegion label="Loading listings">
        <div className="mb-6">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>

        <div className="mb-8 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="mt-1.5 h-11 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-4 h-9 w-20" />
        </div>

        <Skeleton className="mb-4 h-4 w-16" />

        <ItemGridSkeleton />
      </LoadingRegion>
    </div>
  );
}
