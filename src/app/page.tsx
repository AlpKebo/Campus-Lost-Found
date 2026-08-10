import { SetupNotice } from "@/components/SetupNotice";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Landing Page.
 *
 * SAHİBİ: student1 (brief bölüm 1). Ortak setup'ta çalışır bir temel
 * bırakıldı; tasarımı ve içeriği student1 branch'inde geliştirilecek.
 * student2 bu dosyaya dokunmasın.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl py-10 text-center sm:py-16">
      <SetupNotice />

      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
        Campus Lost &amp; Found
      </h1>

      <p className="mx-auto mt-4 max-w-lg text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
        Kampüste bir şey mi kaybettin, yoksa bir şey mi buldun? İlanını
        yayınla, kayıp eşyaları ara ve sahibi olduğun eşya için claim gönder.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/browse">Browse Items</ButtonLink>
        <ButtonLink href="/report" variant="secondary">
          Report Item
        </ButtonLink>
      </div>

      <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
        {[
          {
            title: "1. Report",
            body: "Kaybettiğin veya bulduğun eşyayı görseliyle birlikte yayınla.",
          },
          {
            title: "2. Browse",
            body: "Kategori, konum ve anahtar kelimeyle ilanlar arasında ara.",
          },
          {
            title: "3. Claim",
            body: "Sahibi sensen kanıtınla claim gönder, onaylanınca iletişime geç.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {step.title}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
