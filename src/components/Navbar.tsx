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
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
        >
          Campus Lost &amp; Found
        </Link>

        <ul className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm sm:order-none sm:w-auto">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
                <span className="block font-medium text-neutral-900 dark:text-neutral-100">
                  {profile.name ?? "İsimsiz kullanıcı"}
                </span>
                <span className="block text-neutral-500 dark:text-neutral-400">
                  {profile.email}
                </span>
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
