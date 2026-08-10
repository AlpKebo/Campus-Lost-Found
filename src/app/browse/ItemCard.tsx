import Image from "next/image";
import Link from "next/link";

import { ItemStatusBadge, TypeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Feedback";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatItemDate } from "@/lib/student2-format";
import type { Item } from "@/types/database";

/**
 * Browse listesindeki tek bir ilan kartı.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */

export function ItemCard({ item }: { item: Item }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link href={`/items/${item.id}`} className="block">
        <div className="relative aspect-4/3 bg-neutral-100 dark:bg-neutral-800">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              Görsel yok
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <TypeBadge type={item.type} />
            <ItemStatusBadge status={item.status} />
          </div>

          <h2 className="line-clamp-1 font-medium text-neutral-900 dark:text-neutral-100">
            {item.title}
          </h2>

          <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
            {item.description}
          </p>

          <dl className="mt-3 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex gap-1.5">
              <dt className="sr-only">Kategori</dt>
              <dd>{CATEGORY_LABELS[item.category]}</dd>
              <span aria-hidden="true">·</span>
              <dt className="sr-only">Konum</dt>
              <dd className="line-clamp-1">{item.location}</dd>
            </div>
            <div>
              <dt className="sr-only">Tarih</dt>
              <dd>{formatItemDate(item.item_date)}</dd>
            </div>
          </dl>
        </div>
      </Link>
    </Card>
  );
}
