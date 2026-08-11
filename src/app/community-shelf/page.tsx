import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ClaimStatusBadge, TypeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { Card, EmptyState, PageHeader } from "@/components/ui/Feedback";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatTimestamp } from "@/lib/student2-format";
import type { ReceivedDonationRequest, SentDonationRequest } from "@/types/database";

import { IncomingRequests } from "./IncomingRequests";

/**
 * Community Shelf — 30+ gündür claim'lenmemiş "found" ilanlara yapılan
 * başvurular: hem kendi ilanlarına gelenler hem de başkalarının ilanlarına
 * gönderdiklerin.
 *
 * SAHİBİ: student2 (Discover & Claim). PROTECTED_ROUTES içinde.
 *
 * claims/sent-claims'ten ayrı: bu sayfa "bana lazım" başvurularıyla ilgili,
 * "bu benim" claim'iyle değil. İkisi ayrı tablo (donation_requests / claims),
 * ayrı RPC'ler.
 */

export const metadata: Metadata = {
  title: "Community Shelf — Campus Lost & Found",
  description: "Community Shelf requests you sent and received.",
};

export default async function CommunityShelfPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="py-10">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();

  const [{ data: received, error: receivedError }, { data: sent, error: sentError }] =
    await Promise.all([
      supabase.rpc("received_donation_requests", { p_item_id: null }),
      supabase.rpc("sent_donation_requests"),
    ]);

  const incoming = (received ?? []) as ReceivedDonationRequest[];
  const outgoing = (sent ?? []) as SentDonationRequest[];

  return (
    <div className="py-10">
      <PageHeader
        title="Community Shelf"
        description="Items nobody claimed in 30+ days, and who's asked for them."
        action={
          <ButtonLink href="/browse" variant="secondary">
            Browse
          </ButtonLink>
        }
      />

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Incoming — requests for your listings
        </h2>
        {receivedError ? (
          <FormError>Couldn&apos;t load incoming requests: {receivedError.message}</FormError>
        ) : (
          <IncomingRequests requests={incoming} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Sent — requests you made
        </h2>
        {sentError ? (
          <FormError>Couldn&apos;t load sent requests: {sentError.message}</FormError>
        ) : outgoing.length === 0 ? (
          <EmptyState
            title="You haven't requested anything yet"
            description="Found listings open 30+ days with no claim show an “Available to adopt” badge on Browse — request one from its page."
            action={<ButtonLink href="/browse">Browse items</ButtonLink>}
          />
        ) : (
          <ul className="space-y-4">
            {outgoing.map((request) => (
              <li key={request.request_id}>
                <SentRequestRow request={request} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SentRequestRow({ request }: { request: SentDonationRequest }) {
  // Başvuru hâlâ "pending" ama item artık open değilse, item claim ya da
  // başka bir başvuruyla çoktan çözülmüş demektir — bkz.
  // sent_donation_requests()'teki item_status notu.
  const staleWhilePending = request.status === "pending" && request.item_status !== "open";

  return (
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
            <TypeBadge type="found" />
            <ClaimStatusBadge status={request.status} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatTimestamp(request.created_at)}
            </span>
          </div>

          <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
            <Link href={`/items/${request.item_id}`} className="underline-offset-4 hover:underline">
              {request.item_title}
            </Link>
          </h2>

          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {request.item_location}
          </p>

          <p className="mt-3 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Your message:
            </span>{" "}
            {request.message}
          </p>

          {request.status === "accepted" ? (
            <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-900">
              <p className="font-medium text-emerald-900 dark:text-emerald-100">
                Accepted — you can now contact the owner
              </p>
              <p className="mt-1 text-emerald-800 dark:text-emerald-200">
                {request.owner_name ?? "Unnamed user"}
                {request.owner_email && (
                  <>
                    {" · "}
                    <a
                      href={`mailto:${request.owner_email}`}
                      className="underline underline-offset-4"
                    >
                      {request.owner_email}
                    </a>
                  </>
                )}
              </p>
            </div>
          ) : request.status === "rejected" ? (
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              The owner chose someone else for this one.
            </p>
          ) : staleWhilePending ? (
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              This item is no longer available — it was resolved another way.
            </p>
          ) : (
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              Waiting for the owner to respond. If accepted, their contact details will appear here.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
