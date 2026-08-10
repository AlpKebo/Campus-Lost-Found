"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Sayfa iskeleti: navbar + içerik genişliği.
 *
 * Landing ("/") tam ekran ve menüsüz olmalı; diğer route'larda navbar ve
 * ortalanmış içerik sütunu duruyor. Layout server component olduğu için
 * pathname'i orada okuyamıyoruz, bu yüzden ayrım burada yapılıyor.
 *
 * `navbar` prop olarak geliyor: Navbar bir async server component ve
 * profili sunucuda çekiyor. Children olarak geçirilince client sınırından
 * etkilenmeden server'da render edilmeye devam ediyor.
 */
export function AppChrome({
  navbar,
  children,
}: {
  navbar: ReactNode;
  children: ReactNode;
}) {
  const isLanding = usePathname() === "/";

  if (isLanding) return <>{children}</>;

  return (
    <>
      {navbar}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
