import type { ClaimStatus, ItemStatus, ItemType } from "@/types/database";
import {
  CLAIM_STATUS_LABELS,
  ITEM_STATUS_LABELS,
} from "@/lib/constants";

const BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const ITEM_TYPE_STYLES: Record<ItemType, string> = {
  lost: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900",
  found:
    "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
};

const ITEM_STATUS_STYLES: Record<ItemStatus, string> = {
  open: "bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900",
  claimed:
    "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-900",
  returned:
    "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
  closed:
    "bg-neutral-100 text-neutral-700 ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700",
};

const CLAIM_STATUS_STYLES: Record<ClaimStatus, string> = {
  pending:
    "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900",
  accepted:
    "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900",
  rejected:
    "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:ring-rose-900",
};

export function TypeBadge({ type }: { type: ItemType }) {
  return (
    <span className={`${BASE} ${ITEM_TYPE_STYLES[type]}`}>
      {type === "lost" ? "Lost" : "Found"}
    </span>
  );
}

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span className={`${BASE} ${ITEM_STATUS_STYLES[status]}`}>
      {ITEM_STATUS_LABELS[status]}
    </span>
  );
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span className={`${BASE} ${CLAIM_STATUS_STYLES[status]}`}>
      {CLAIM_STATUS_LABELS[status]}
    </span>
  );
}
