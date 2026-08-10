"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ClaimStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { formatItemDate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";
import type { ItemStatus, ReceivedClaim } from "@/types/database";

/**
 * Gelen claim'ler — brief bölüm 9 ve 10.
 *
 * Brief: "Ayrı bir Received Claims sayfası oluşturma. Gelen claim'leri
 * My Listings içinde göster." O yüzden bu bileşen ListingCard'ın içinde
 * yaşıyor, kendi route'u yok.
 *
 * Claim'ler yalnızca type = 'found' listing'lerde bulunabilir; bu kural
 * schema.sql'deki claims_insert_own policy'sinde de var.
 *
 * SAHİBİ: student1.
 */

/** "2026-08-10T12:30:00+00:00" -> "10.08.2026" */
function formatTimestamp(timestamp: string) {
  return formatItemDate(timestamp.slice(0, 10));
}

export function ReceivedClaims({
  itemStatus,
  claims,
}: {
  itemStatus: ItemStatus;
  claims: ReceivedClaim[];
}) {
  const router = useRouter();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Karar yalnızca item open'ken verilir: claimed ise zaten kabul edilmiş
  // bir claim var, returned/closed ise iş bitmiş.
  const canDecide = itemStatus === "open";

  async function handleAccept(claimId: string) {
    setError(null);
    setPendingId(claimId);

    // Üç güncelleme tek transaction'da — bkz. student1_accept_claim.sql
    const supabase = createClient();
    const { error: acceptError } = await supabase.rpc("accept_claim", {
      p_claim_id: claimId,
    });

    if (acceptError) {
      setError(acceptError.message);
      setPendingId(null);
      return;
    }

    router.refresh();
    setPendingId(null);
  }

  async function handleReject(claimId: string) {
    setError(null);
    setPendingId(claimId);

    const supabase = createClient();
    const { error: rejectError } = await supabase
      .from("claims")
      .update({ status: "rejected" })
      .eq("id", claimId);

    if (rejectError) {
      setError(rejectError.message);
      setPendingId(null);
      return;
    }

    router.refresh();
    setPendingId(null);
  }

  if (claims.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Bu ilana henüz claim gelmedi.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
        Received Claims ({claims.length})
      </h3>

      {error && <FormError>{error}</FormError>}

      <ul className="space-y-3">
        {claims.map((claim) => (
          <li
            key={claim.claim_id}
            className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {claim.claimant_name ?? "İsimsiz kullanıcı"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatTimestamp(claim.created_at)}
                </span>
                <ClaimStatusBadge status={claim.status} />
              </div>
            </div>

            <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Proof of Ownership
            </p>
            <p className="mt-0.5 text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
              {claim.message}
            </p>

            {/* Email yalnızca claim kabul edildikten sonra dolu gelir —
                kuralı received_claims() fonksiyonu uyguluyor, burada
                sadece geleni gösteriyoruz. */}
            {claim.status === "accepted" && claim.claimant_email && (
              <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="text-neutral-500 dark:text-neutral-400">
                  İletişim:{" "}
                </span>
                <a
                  href={`mailto:${claim.claimant_email}`}
                  className="underline underline-offset-2"
                >
                  {claim.claimant_email}
                </a>
              </p>
            )}

            {claim.status === "pending" && canDecide && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(claim.claim_id)}
                  disabled={pendingId !== null}
                >
                  {pendingId === claim.claim_id && <Spinner />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReject(claim.claim_id)}
                  disabled={pendingId !== null}
                >
                  Reject
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
