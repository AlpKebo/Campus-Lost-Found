import Image from "next/image";

import { ListingActions } from "@/app/my-listings/ListingActions";
import { ReceivedClaims } from "@/app/my-listings/ReceivedClaims";
import { ItemStatusBadge, TypeBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Feedback";
import { CATEGORY_LABELS } from "@/lib/constants";
import { formatItemDate } from "@/lib/dates";
import type { Item, ReceivedClaim } from "@/types/database";

/**
 * My Listings kartı — brief bölüm 6.
 * Gösterilmesi zorunlu alanlar: Image, Type, Title, Category, Location,
 * Date, Status.
 *
 * SAHİBİ: student1.
 */
export function ListingCard({
  item,
  claims,
}: {
  item: Item;
  /** Bu ilana gelen claim'ler. Lost item'larda her zaman boş. */
  claims: ReceivedClaim[];
}) {
  // Brief bölüm 8: pending veya accepted claim varsa delete yerine Close.
  const hasActiveClaims = claims.some(
    (claim) => claim.status === "pending" || claim.status === "accepted",
  );
  return (
    <Card>
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-44 w-full shrink-0 bg-neutral-100 sm:h-auto sm:w-44 dark:bg-neutral-800">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 11rem, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={item.type} />
            <ItemStatusBadge status={item.status} />
          </div>

          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
            {item.title}
          </h2>

          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">
                Category
              </dt>
              <dd className="text-neutral-800 dark:text-neutral-200">
                {CATEGORY_LABELS[item.category]}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-neutral-500 dark:text-neutral-400">Date</dt>
              <dd className="text-neutral-800 dark:text-neutral-200">
                {formatItemDate(item.item_date)}
              </dd>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <dt className="text-neutral-500 dark:text-neutral-400">
                Location
              </dt>
              <dd className="text-neutral-800 dark:text-neutral-200">
                {item.location}
              </dd>
            </div>
          </dl>

          <div className="mt-auto pt-1">
            <ListingActions item={item} hasActiveClaims={hasActiveClaims} />
          </div>
        </div>
      </div>

      {/* Claim yalnızca found item'lara gelebilir (brief bölüm 9). */}
      {item.type === "found" && (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <ReceivedClaims itemStatus={item.status} claims={claims} />
        </div>
      )}
    </Card>
  );
}
