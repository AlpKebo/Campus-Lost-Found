import { Card } from "@/components/ui/Feedback";

/**
 * student2 sayfalarının loading.tsx dosyalarında kullanılan iskelet parçaları.
 *
 * SAHİBİ: student2 (Discover & Claim). Dosya adı bilerek student2 ile
 * başlıyor: src/components ortak bir klasör, aynı isimde iki dosya açılırsa
 * merge conflict çıkar.
 *
 * İskeletin amacı gerçek içeriğin yerini tutmak: kutular yüklenecek öğelerle
 * aynı ölçüde olmalı, yoksa içerik gelince sayfa zıplar.
 */

/** Tek bir gri nabız kutusu. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-white/10 ${className ?? ""}`.trim()}
    />
  );
}

/**
 * Yükleniyor bölgesini ekran okuyuculara duyurur. İskeletin kendisi
 * aria-hidden; sesli okunacak tek şey bu metin.
 */
export function LoadingRegion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** ItemCard ile aynı ölçüde iskelet — browse ızgarası için. */
export function ItemCardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-4/3 rounded-none" />
      <div className="p-4">
        <div className="mb-2 flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-5/6" />
        <Skeleton className="mt-3 h-3 w-2/3" />
        <Skeleton className="mt-1.5 h-3 w-1/3" />
      </div>
    </Card>
  );
}

/** Browse ızgarasının tamamı. */
export function ItemGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}
