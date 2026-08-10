"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { removeItemImage, storagePathFromPublicUrl } from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/client";
import type { Item, ItemStatus } from "@/types/database";

/**
 * Listing aksiyonları — brief bölüm 8 ve 11.
 *
 * Bölüm 8: claim'i olmayan listing silinebilir. Pending veya accepted claim
 * geldiyse delete YOK, onun yerine Close Listing.
 *
 * Delete'i gizlemek sadece UI tarafı. Asıl engel schema.sql'deki
 * items_delete_own policy'sinde: aktif claim varsa DB satırı sildirmez.
 *
 * Bölüm 11 — statü akışı:
 *   lost:  open -> returned
 *   found: open -> claimed -> returned
 * Yani found item'da Mark as Returned ancak bir claim kabul edildikten
 * sonra (status = claimed) çıkar; henüz sahibi bulunmamış bir found item
 * "iade edildi" olamaz.
 *
 * SAHİBİ: student1.
 */
export function ListingActions({
  item,
  hasActiveClaims,
}: {
  item: Item;
  hasActiveClaims: boolean;
}) {
  const router = useRouter();

  const [pending, setPending] = useState<
    "close" | "delete" | "returned" | null
  >(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canClose = item.status === "open" || item.status === "claimed";

  const canMarkReturned =
    (item.type === "lost" && item.status === "open") ||
    (item.type === "found" && item.status === "claimed");

  async function updateStatus(
    status: ItemStatus,
    action: "close" | "returned",
  ) {
    setError(null);
    setPending(action);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("items")
      .update({ status })
      .eq("id", item.id)
      // owner_id şartı RLS'te de var; burada ikinci bir emniyet.
      .eq("owner_id", item.owner_id);

    if (updateError) {
      setError(updateError.message);
      setPending(null);
      return;
    }

    router.refresh();
    setPending(null);
  }

  async function handleDelete() {
    setError(null);
    setPending("delete");

    const supabase = createClient();
    const { error: deleteError, count } = await supabase
      .from("items")
      .delete({ count: "exact" })
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      setPending(null);
      return;
    }

    // RLS satırı sildirmediyse hata değil, 0 satır döner: kullanıcı
    // sayfayı açtıktan sonra ilana claim gelmiş olabilir.
    if (count === 0) {
      setError(
        "Bu ilan silinemedi — bu sırada bir claim gelmiş olabilir. " +
          "Sayfayı yenileyip Close Listing kullan.",
      );
      setPending(null);
      router.refresh();
      return;
    }

    // Satır gittiyse görsel bucket'ta öksüz kalmasın.
    const path = storagePathFromPublicUrl(item.image_url);
    if (path) await removeItemImage(path);

    router.refresh();
    setPending(null);
  }

  return (
    <div className="space-y-2">
      {error && <FormError>{error}</FormError>}

      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink
          href={`/my-listings/${item.id}/edit`}
          variant="secondary"
          size="sm"
        >
          Edit
        </ButtonLink>

        {canMarkReturned && (
          <Button
            size="sm"
            onClick={() => updateStatus("returned", "returned")}
            disabled={pending !== null}
          >
            {pending === "returned" && <Spinner />}
            Mark as Returned
          </Button>
        )}

        {canClose && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => updateStatus("closed", "close")}
            disabled={pending !== null}
          >
            {pending === "close" && <Spinner />}
            Close Listing
          </Button>
        )}

        {hasActiveClaims ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Bu ilana claim geldiği için silinemez. Yayından kaldırmak için
            Close Listing kullan.
          </p>
        ) : confirmingDelete ? (
          <>
            <span className="text-xs text-neutral-600 dark:text-neutral-300">
              İlan kalıcı olarak silinsin mi?
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={pending !== null}
            >
              {pending === "delete" && <Spinner />}
              Evet, sil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={pending !== null}
            >
              Vazgeç
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending !== null}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
