import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { SetupNotice } from "@/components/SetupNotice";
import { ButtonLink } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/constants";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Landing Page.
 *
 * SAHİBİ: student1 (brief bölüm 1). student2 bu dosyaya dokunmasın.
 *
 * Kurgu: tek ekranda etki yaratan dev başlık + doğrudan işe yarayan cam
 * arama kutusu. Arama formu GET ile /browse'a gider, yani student2'nin
 * filtre sözleşmesini (querystring'deki `q`) aynen kullanır — landing'in
 * kendi arama mantığı yok, tek kaynak browse sayfası.
 */

/** Hero altında hızlı giriş için öne çıkan kategoriler. */
const QUICK_CATEGORIES = CATEGORIES.filter((category) =>
  ["electronics", "keys", "wallet_money", "bag", "id_cards"].includes(
    category.value,
  ),
);

const STEPS = [
  {
    number: "01",
    title: "Report",
    body: "Post what you lost or found, with a photo.",
  },
  {
    number: "02",
    title: "Browse",
    body: "Search by category, location and keyword.",
  },
  {
    number: "03",
    title: "Claim",
    body: "Prove it's yours, get approved, get it back.",
  },
];

export default async function HomePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="py-6 sm:py-10">
      <SetupNotice />

      {/* Hero. Işık küresi dekoratif; okuyuculardan gizli. */}
      <section className="relative isolate">
        <div
          aria-hidden
          className="orb pointer-events-none absolute -top-32 left-1/2 -z-10 size-[34rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgb(34 211 238 / 0.28), rgb(240 52 159 / 0.14) 45%, transparent 70%)",
          }}
        />

        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-glow">
          Campus Lost &amp; Found
        </p>

        <h1 className="mt-5 text-center font-display text-5xl leading-[0.92] font-extrabold text-ink sm:text-7xl">
          FIND WHAT
          <br />
          YOU&apos;VE <span className="text-glow-gradient">LOST</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-center text-base text-ink-soft sm:text-lg">
          Lost something on campus, or found something that isn&apos;t yours?
          Post it, search it, claim it — and get it back to its owner.
        </p>

        {/* Cam arama kutusu — /browse'a GET ile gider. */}
        <form
          action="/browse"
          method="get"
          role="search"
          className="glass-base glass-clear mx-auto mt-9 flex max-w-xl items-center gap-2 rounded-full p-2"
        >
          <label htmlFor="hero-search" className="sr-only">
            Search items
          </label>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="ml-3 size-5 shrink-0 text-ink-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="hero-search"
            name="q"
            type="search"
            maxLength={100}
            placeholder="What are you looking for?"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none sm:text-base"
          />
          <button
            type="submit"
            className="glass-base glass-accent shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-on-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            Search
          </button>
        </form>

        {/* Kategori çipleri — aramayı boş bırakıp doğrudan filtreye atlar. */}
        <ul className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
          {QUICK_CATEGORIES.map((category) => (
            <li key={category.value}>
              <Link
                href={`/browse?category=${category.value}`}
                className="glass-base glass-clear inline-block rounded-full px-4 py-1.5 text-sm font-medium text-ink-soft hover:text-ink"
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/browse">Browse all items</ButtonLink>
          <ButtonLink href="/report" variant="secondary">
            Report an item
          </ButtonLink>
        </div>
      </section>

      {/* Brief bölüm 1: login / logout alanı ana sayfada da görünür olmalı,
          çünkü navbar'daki kullanıcı bilgisi küçük ekranlarda gizleniyor. */}
      <div className="mt-10 flex justify-center">
        {profile ? (
          <div className="glass-card flex flex-col items-center gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:gap-4">
            <span className="text-left text-sm leading-tight">
              <span className="block font-semibold text-ink">
                {profile.name ?? "Unnamed user"}
              </span>
              <span className="block text-ink-faint">{profile.email}</span>
            </span>
            {!profile.name && (
              <ButtonLink href="/profile-setup" size="sm" variant="secondary">
                Add your name
              </ButtonLink>
            )}
            <LogoutButton />
          </div>
        ) : (
          <ButtonLink href="/login" variant="ghost" size="sm">
            Already have an account? Log in
          </ButtonLink>
        )}
      </div>

      {/* İnce 3 adım şeridi. */}
      <ol className="mt-14 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.number} className="glass-card rounded-2xl p-5">
            <span className="font-display text-2xl font-extrabold text-glow">
              {step.number}
            </span>
            <p className="mt-2 text-base font-bold text-ink">{step.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
