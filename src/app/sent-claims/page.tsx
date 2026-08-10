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
import type { SentClaim } from "@/types/database";

/**
 * Sent Claims — kullanıcının gönderdiği claim'ler ve durumları.
 *
 * SAHİBİ: student2 (Discover & Claim). PROTECTED_ROUTES içinde; login
 * kontrolünü proxy yapıyor, buraya login olmadan gelinmiyor.
 *
 * Veri doğrudan claims tablosundan değil sent_claims() RPC'sinden geliyor:
 * profiles RLS ile kilitli, ilan sahibinin adı ve e-postası yalnızca claim
 * accepted olduğunda o fonksiyondan dönüyor.
 */

export const metadata: Metadata = {
  title: "Sent Claims — Campus Lost & Found",
  description: "The claims you sent and their status.",
};

export default async function SentClaimsPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="py-10">
        <SetupNotice />
      </div>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sent_claims");
  const claims = (data ?? []) as SentClaim[];

  const accepted = claims.filter((c) => c.status === "accepted").length;
  const pending = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="py-10">
      <PageHeader
        title="Sent Claims"
        description={
          claims.length > 0
            ? `${claims.length} claims · ${pending} pending · ${accepted} accepted`
            : "The claims you send are listed here."
        }
        action={
          <ButtonLink href="/browse" variant="secondary">
            Browse
          </ButtonLink>
        }
      />

      {error ? (
        <FormError>Couldn&apos;t load claims: {error.message}</FormError>
      ) : claims.length === 0 ? (
        <EmptyState
          title="You haven't sent any claims yet"
          description="If you spot your item among the found listings, send a claim from its page."
          action={<ButtonLink href="/browse">Browse items</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {claims.map((claim) => (
            <li key={claim.claim_id}>
              <ClaimRow claim={claim} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClaimRow({ claim }: { claim: SentClaim }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <Link
          href={`/items/${claim.item_id}`}
          className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 sm:aspect-square sm:w-32 dark:bg-neutral-800"
        >
          {claim.item_image_url ? (
            <Image
              src={claim.item_image_url}
              alt={claim.item_title}
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
            <TypeBadge type={claim.item_type} />
            <ClaimStatusBadge status={claim.status} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatTimestamp(claim.created_at)}
            </span>
          </div>

          <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
            <Link
              href={`/items/${claim.item_id}`}
              className="underline-offset-4 hover:underline"
            >
              {claim.item_title}
            </Link>
          </h2>

          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {claim.item_location}
          </p>

          <p className="mt-3 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Your message:
            </span>{" "}
            {claim.message}
          </p>

          <StatusDetail claim={claim} />
        </div>
      </div>
    </Card>
  );
}

/** Claim durumuna göre alt bilgi. İletişim yalnızca accepted'da görünür. */
function StatusDetail({ claim }: { claim: SentClaim }) {
  if (claim.status === "accepted") {
    return (
      <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950 dark:ring-emerald-900">
        <p className="font-medium text-emerald-900 dark:text-emerald-100">
          Accepted — you can now contact the owner
        </p>
        <p className="mt-1 text-emerald-800 dark:text-emerald-200">
          {claim.owner_name ?? "Unnamed user"}
          {claim.owner_email && (
            <>
              {" · "}
              <a
                href={`mailto:${claim.owner_email}`}
                className="underline underline-offset-4"
              >
                {claim.owner_email}
              </a>
            </>
          )}
        </p>
      </div>
    );
  }

  if (claim.status === "rejected") {
    return (
      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
        The owner rejected this claim.
      </p>
    );
  }

  return (
    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
      Waiting for the owner to respond. If accepted, their contact details will
      appear here.
    </p>
  );
}
