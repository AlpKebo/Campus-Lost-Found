"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

/**
 * student2 route'larının error.tsx dosyalarının paylaştığı hata ekranı.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * NEDEN ORTAK BİR BİLEŞEN: error.tsx her route klasöründe ayrı durmak
 * zorunda ama içerikleri neredeyse aynı. Metin farkı prop olarak geçiliyor.
 *
 * NEDEN "use client": error.tsx bir React error boundary'si, boundary'ler
 * yalnızca client component olabilir.
 */

export function RouteError({
  error,
  retry,
  title,
  description,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  /**
   * Next 16'da error boundary'nin toparlanma fonksiyonu `retry` — segmenti
   * yeniden veri çekerek render eder. Eski sürümlerdeki `reset` yalnızca
   * hata durumunu temizliyordu, veriyi tazelemiyordu.
   */
  retry: () => void;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}) {
  useEffect(() => {
    // Sunucu hatalarında mesaj istemciye jenerik geliyor; eşleştirme
    // yapabilmek için digest'i de yazdırıyoruz.
    console.error("[student2] route error:", error.digest ?? "", error);
  }, [error]);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </h1>

        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => retry()}>Tekrar dene</Button>

          {backHref && backLabel && (
            <Link
              href={backHref}
              className="text-sm text-neutral-500 underline-offset-4 hover:underline dark:text-neutral-400"
            >
              {backLabel}
            </Link>
          )}
        </div>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-neutral-400 dark:text-neutral-600">
            Hata kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
