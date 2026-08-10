import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { ButtonLink } from "@/components/ui/Button";
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
        <Link href="/" className="group flex items-center gap-2">
          {/* Logo yerine geçen küçük marka öğesi. */}
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-glow to-magenta text-sm text-on-glow shadow-md transition-transform group-hover:-rotate-12"
          >
            ✦
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Campus Lost &amp; Found
          </span>
        </Link>

        <ul className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-ink-soft transition-colors hover:bg-white/10 hover:text-ink"
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
