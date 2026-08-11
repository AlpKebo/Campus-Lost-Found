import type { ClaimStatus, ItemStatus, ItemType } from "@/types/database";
import {
  CLAIM_STATUS_LABELS,
  ITEM_STATUS_LABELS,
} from "@/lib/constants";

/*
 * Rozetler koyu zeminde duruyor: düşük opaklıkta renkli dolgu + aynı rengin
 * açık tonunda metin. Açık tema rozetlerinin (bg-*-100 / text-*-700) tersi.
 */
const BASE =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
  "ring-1 ring-inset backdrop-blur-sm";

const ITEM_TYPE_STYLES: Record<ItemType, string> = {
  lost: "bg-fuchsia-400/15 text-fuchsia-300 ring-fuchsia-400/30",
  found: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
};

const ITEM_STATUS_STYLES: Record<ItemStatus, string> = {
  open: "bg-cyan-400/15 text-cyan-300 ring-cyan-400/30",
  claimed: "bg-violet-400/15 text-violet-300 ring-violet-400/30",
  returned: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  closed: "bg-slate-400/15 text-slate-300 ring-slate-400/30",
  donated: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
};

const CLAIM_STATUS_STYLES: Record<ClaimStatus, string> = {
  pending: "bg-amber-300/15 text-amber-200 ring-amber-300/30",
  accepted: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
  rejected: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
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
