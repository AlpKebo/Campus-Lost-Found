"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ClaimStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState, Spinner } from "@/components/ui/Feedback";
import { FormError } from "@/components/ui/Field";
import { formatTimestamp } from "@/lib/student2-format";
import { createClient } from "@/lib/supabase/client";
import type { ReceivedDonationRequest } from "@/types/database";

/**
 * Kendi ilanlarına gelen Community Shelf başvuruları — /community-shelf
 * sayfasının "Incoming" bölümü.
 *
 * ReceivedClaims (my-listings) ile aynı desen: accept_donation_request tek
 * transaction'da başvuruyu kabul eder, diğer bekleyenleri reddeder, item'ı
 * donated yapar. Reject tek satırlık bir update.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */
export function IncomingRequests({
  requests,
}: {
  requests: ReceivedDonationRequest[];
}) {
  const router = useRouter();

  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept(requestId: string) {
    setError(null);
    setPendingId(requestId);

    const supabase = createClient();
    const { error: acceptError } = await supabase.rpc(
      "accept_donation_request",
      { p_request_id: requestId },
    );

    if (acceptError) {
      setError(acceptError.message);
      setPendingId(null);
      return;
    }

    router.refresh();
    setPendingId(null);
  }

  async function handleReject(requestId: string) {
    setError(null);
    setPendingId(requestId);

    const supabase = createClient();
    const { error: rejectError } = await supabase
      .from("donation_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (rejectError) {
      setError(rejectError.message);
      setPendingId(null);
      return;
    }

    router.refresh();
    setPendingId(null);
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="If one of your found listings goes 30+ days without a claim, people can request it here — and you'll see their message before deciding."
      />
    );
  }

  return (
    <div>
      {error && <FormError>{error}</FormError>}

      <ul className="mt-3 space-y-4">
        {requests.map((request) => {
          // Aynı item'a birden fazla başvuru gelmiş olabilir; owner sadece
          // hâlâ pending olanlar için karar verebilir (accepted/rejected
          // zaten sonuçlanmış, item de artık open olmayabilir).
          const canDecide = request.status === "pending";

          return (
            <li key={request.request_id}>
              <Card>
                <div className="flex flex-col gap-4 p-4 sm:flex-row">
                  <Link
                    href={`/items/${request.item_id}`}
                    className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:aspect-square sm:w-32 dark:bg-neutral-800"
                  >
                    {request.item_image_url ? (
                      <Image
                        src={request.item_image_url}
                        alt={request.item_title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-neutral-400">
                        No image
                      </span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <ClaimStatusBadge status={request.status} />
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatTimestamp(request.created_at)}
                      </span>
                    </div>

                    <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
                      <Link
                        href={`/items/${request.item_id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {request.item_title}
                      </Link>
                    </h2>

                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                      {request.item_location}
                    </p>

                    <p className="mt-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      From {request.requester_name ?? "Unnamed user"}
                    </p>
                    <p className="mt-0.5 text-sm whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                      {request.message}
                    </p>

                    {request.status === "accepted" && request.requester_email && (
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <span className="text-neutral-500 dark:text-neutral-400">
                          Contact:{" "}
                        </span>
                        <a
                          href={`mailto:${request.requester_email}`}
                          className="underline underline-offset-2"
                        >
                          {request.requester_email}
                        </a>
                      </p>
                    )}

                    {canDecide && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.request_id)}
                          disabled={pendingId !== null}
                        >
                          {pendingId === request.request_id && <Spinner />}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleReject(request.request_id)}
                          disabled={pendingId !== null}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
