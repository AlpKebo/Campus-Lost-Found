import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ClaimStatusBadge, ItemStatusBadge, TypeBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Feedback";
import { SetupNotice } from "@/components/SetupNotice";
import { CATEGORY_LABELS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatItemDate } from "@/lib/student2-format";
import type { Claim, Item } from "@/types/database";

import { ClaimForm } from "./ClaimForm";
import { RelatedItems, RelatedItemsSkeleton } from "./RelatedItems";

/**
 * Item Detail — tek bir ilanın tüm ayrıntısı ve claim gönderme paneli.
 *
 * SAHİBİ: student2 (Discover & Claim). Public route; ilanı görmek için
 * login gerekmez, claim göndermek için gerekir.
 */

type PageProps = { params: Promise<{ id: string }> };

/** Geçersiz bir id ile gelen istek Postgres'e uuid hatası attırmasın. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadItem(id: string): Promise<Item | null> {
  if (!UUID_RE.test(id)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) return { title: "Item — Campus Lost & Found" };

  const item = await loadItem((await params).id);
  if (!item) return { title: "İlan bulunamadı — Campus Lost & Found" };

  return {
    title: `${item.title} — Campus Lost & Found`,
    description: item.description.slice(0, 160),
  };
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return (
      <div className="py-10">
        <SetupNotice />
      </div>
    );
  }

  const item = await loadItem(id);
  if (!item) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kendi claim'ini görebilirsin (claims_select_own_or_owner).
  let myClaim: Claim | null = null;
  if (user) {
    const { data } = await supabase
      .from("claims")
      .select("*")
      .eq("item_id", item.id)
      .eq("claimant_id", user.id)
      .maybeSingle();
    myClaim = data;
  }

  const isOwner = user?.id === item.owner_id;

  return (
    <div className="py-10">
      <Link
        href="/browse"
        className="mb-6 inline-block text-sm text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
      >
        ← Browse&apos;a dön
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="self-start">
          <div className="relative aspect-4/3 bg-neutral-100 dark:bg-neutral-800">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Görsel yok
              </div>
            )}
          </div>
        </Card>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <TypeBadge type={item.type} />
            <ItemStatusBadge status={item.status} />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-50">
            {item.title}
          </h1>

          <p className="mt-4 whitespace-pre-line text-neutral-700 dark:text-neutral-300">
            {item.description}
          </p>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-neutral-500 dark:text-neutral-400">Kategori</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {CATEGORY_LABELS[item.category]}
            </dd>

            <dt className="text-neutral-500 dark:text-neutral-400">Konum</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {item.location}
            </dd>

            <dt className="text-neutral-500 dark:text-neutral-400">
              {item.type === "lost" ? "Kaybedildiği tarih" : "Bulunduğu tarih"}
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {formatItemDate(item.item_date)}
            </dd>
          </dl>

          <div className="mt-8 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
            <ClaimPanel
              item={item}
              isOwner={isOwner}
              isLoggedIn={Boolean(user)}
              myClaim={myClaim}
            />
          </div>
        </div>
      </div>

      {/* Ayrı sorgu; Suspense sayesinde detayın gelmesini bekletmiyor. */}
      <Suspense fallback={<RelatedItemsSkeleton />}>
        <RelatedItems item={item} />
      </Suspense>
    </div>
  );
}

/**
 * Claim panelinin hangi hâlde görüneceği. Sıralama önemli: en kesin engel
 * en üstte. Kurallar RLS'teki claims_insert_own ile birebir aynı.
 */
function ClaimPanel({
  item,
  isOwner,
  isLoggedIn,
  myClaim,
}: {
  item: Item;
  isOwner: boolean;
  isLoggedIn: boolean;
  myClaim: Claim | null;
}) {
  if (isOwner) {
    return (
      <Note title="Bu senin ilanın">
        Gelen claim&apos;leri{" "}
        <Link href="/my-listings" className="underline underline-offset-4">
          My Listings
        </Link>{" "}
        sayfasından görebilirsin.
      </Note>
    );
  }

  if (item.type === "lost") {
    return (
      <Note title="Bu bir kayıp ilanı">
        Kayıp ilanlarına claim gönderilmez. Bu eşyayı bulduysan kendi{" "}
        <Link href="/report" className="underline underline-offset-4">
          Found ilanını
        </Link>{" "}
        aç; sahibi seni oradan bulur.
      </Note>
    );
  }

  if (myClaim) {
    return (
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
            Claim&apos;ini gönderdin
          </h2>
          <ClaimStatusBadge status={myClaim.status} />
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {myClaim.status === "accepted"
            ? "Onaylandı. İlan sahibinin iletişim bilgileri Sent Claims sayfanda."
            : myClaim.status === "rejected"
              ? "İlan sahibi bu claim'i reddetti."
              : "İlan sahibinin yanıtı bekleniyor."}
        </p>
        <div className="mt-4">
          <ButtonLink href="/sent-claims" variant="secondary" size="sm">
            Sent Claims
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (item.status !== "open") {
    return (
      <Note title="Bu ilan claim kabul etmiyor">
        İlan şu anda &quot;{item.status}&quot; durumunda. Sahibi olduğunu
        düşünüyorsan ilan sahibiyle başka bir yoldan iletişime geç.
      </Note>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
          Bu eşya senin mi?
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Claim göndermek için giriş yapman gerekiyor.
        </p>
        <div className="mt-4">
          <ButtonLink href={`/login?next=/items/${item.id}`}>
            Giriş yap
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 font-medium text-neutral-900 dark:text-neutral-100">
        Bu eşya senin mi?
      </h2>
      <ClaimForm itemId={item.id} />
    </div>
  );
}

function Note({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-medium text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {children}
      </p>
    </div>
  );
}
