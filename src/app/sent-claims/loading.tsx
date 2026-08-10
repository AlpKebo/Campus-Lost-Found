import { Card } from "@/components/ui/Feedback";
import { LoadingRegion, Skeleton } from "@/components/student2-Skeleton";

/**
 * /sent-claims yüklenirken görünen iskelet.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * Sayfa sent_claims() RPC'sini bekliyor; bu dosya o bekleme sırasında
 * listenin yerini tutuyor.
 */
export default function SentClaimsLoading() {
  return (
    <div className="py-10">
      <LoadingRegion label="Claim'ler yükleniyor">
        <div className="mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <Skeleton className="aspect-4/3 w-full shrink-0 rounded-lg sm:aspect-square sm:w-32" />

                <div className="flex-1">
                  <div className="mb-1.5 flex gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="mt-1.5 h-4 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-1.5 h-4 w-4/5" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </LoadingRegion>
    </div>
  );
}
