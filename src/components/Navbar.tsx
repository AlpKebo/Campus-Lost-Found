import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Logo";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * ORTAK DOSYA — DİKKAT.
 *
 * Bütün route'ların linki baştan buraya konuldu ki student1 ve student2
 * bu dosyayı sonradan ayrı ayrı düzenlemek zorunda kalmasın. İki taraf da
 * bu dosyaya dokunursa merge conflict çıkar. Değiştirmen gerekirse önce
 * karşı tarafa haber ver.
 */

const NAV_LINKS = [
  { href: "/browse", label: "Browse" }, // student2
  { href: "/report", label: "Report Item" }, // student1
  { href: "/my-listings", label: "My Listings" }, // student1
  { href: "/sent-claims", label: "Sent Claims" }, // student2
];

export async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-canvas/70 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="group flex items-center">
          <Wordmark />
        </Link>

        {/*
          İnce dikey ayraç: marka ile gezinme linklerini ayrı gruplar olarak
          okutuyor. Küçük ekranda linkler alta indiği için orada gizli.
        */}
        <span
          aria-hidden
          className="mx-1 hidden h-6 w-px bg-white/15 sm:block"
        />

        <ul className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                // İkincil ağırlık: marka adından daha soluk ve daha ince,
                // hover'da tam kontrasta çıkıyor. Koyu zeminde okunaklı
                // kalması için "soluk" hâlâ yüksek kontrastlı bir ton.
                // py-2: dokunma hedefi mobilde 44px'e yaklaşsın (WCAG 2.5.8
                // asgari 24px, Apple/Google önerisi 44px).
                className="block rounded-full px-3 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:bg-white/12 hover:text-ink"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          {profile ? (
            <>
              <span className="hidden text-right text-xs leading-tight sm:block">
                <span className="block font-medium text-ink">
                  {profile.name ?? "Unnamed user"}
                </span>
                <span className="block text-ink-faint">{profile.email}</span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <ButtonLink href="/login" size="sm">
              Login
            </ButtonLink>
          )}
        </div>
      </nav>
    </header>
  );
}
