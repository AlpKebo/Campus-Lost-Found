import Link from "next/link";

import { LogoutButton } from "@/components/LogoutButton";
import { SetupNotice } from "@/components/SetupNotice";
import { AnimatedFolder } from "@/components/ui/folder-stack";
import { Wordmark } from "@/components/ui/Logo";
import { LANDING_ITEMS } from "@/lib/landing-items.generated";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Landing Page.
 *
 * SAHİBİ: student1 (brief bölüm 1). student2 bu dosyaya dokunmasın.
 *
 * Kurgu: tek ekrana sığan, menüsüz bir giriş. Navbar burada gizleniyor
 * (bkz. AppChrome); brief bölüm 1'in "login alanı landing'de de görünmeli"
 * şartını sağ üstteki cam hap karşılıyor.
 *
 * Klasördeki ürün görselleri fal.ai ile üretildi ve repoda public/
 * landing-items altında duruyor (bkz. npm run landing:images). Bunlar
 * dekoratif: gerçek ilan verisi Browse'da.
 */

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
    // md üstünde tek ekrana kilitli; altında dikey akmasına izin veriyoruz
    // çünkü telefonda üç sütun + üç kart tek ekrana sığmıyor.
    <div className="relative flex min-h-[100svh] flex-col px-5 py-4 sm:px-8 md:h-[100svh] md:overflow-hidden">
      {/*
        Üst şerit: solda kelime markası, sağda login. Menü yok — brief bölüm
        1'in "login landing'de de görünmeli" şartını sağdaki öğe karşılıyor.
        absolute: akıştan çıkıyor ki içerik viewport'un tamamına göre
        ortalansın, şeridin yüksekliği kadar aşağı kaymasın.
      */}
      <div className="absolute inset-x-5 top-4 z-20 flex items-center justify-between sm:inset-x-8">
        <Link href="/" aria-label="Campus Lost & Found" className="group">
          <Wordmark />
        </Link>
      </div>

      <header className="absolute top-4 right-5 z-20 sm:right-8">
        {profile ? (
          <div className="glass-base glass-clear flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-4">
            <span className="text-sm font-medium text-ink">
              {profile.name ?? "Unnamed user"}
            </span>
            {!profile.name && (
              <Link
                href="/profile-setup"
                className="text-sm font-semibold text-glow underline-offset-4 hover:underline"
              >
                Add name
              </Link>
            )}
            <LogoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="glass-base glass-clear rounded-full px-5 py-2 text-sm font-bold text-ink"
          >
            Log in
          </Link>
        )}
      </header>

      <SetupNotice />

      {/*
        Hero ve adım şeridi tek bir blok olarak dikeyde ortalanıyor.
        Önceden main flex-1 idi ve boşluğun tamamı ikisinin ARASINA
        düşüyordu; böylece adımlar yukarı geldi, artan boşluk alta kaldı.
      */}
      {/*
        Hero ve adım şeridi tek blok olarak dikeyde ortalanıyor. Aradaki
        boşluk bilerek geniş: adım şeridi ekranın alt yarısına insin,
        altta yalnızca ince bir pay kalsın.
      */}
      <div className="flex flex-1 flex-col justify-center gap-16 pb-4 xl:gap-24">
        <main className="mx-auto grid w-full max-w-6xl items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-4 xl:gap-8">
          <div className="text-center md:text-left">
            <h1 className="font-display text-5xl leading-[1.0] text-ink md:text-6xl xl:text-7xl">
              We find what
              <br />
              you&apos;ve <span className="text-glow-gradient">lost</span>.
            </h1>

            {/*
              İki satır, iki renk: ilki kurulum (lila), ikincisi vurucu kısım
              ve başlıktaki "lost" ile aynı siyan→magenta gradyanı taşıyor —
              göz ikisini birbirine bağlasın diye.
            */}
            <p className="mx-auto mt-5 max-w-lg text-xl leading-snug font-semibold italic md:mx-0 xl:text-2xl">
              <span className="block text-violet-100">
                Like finding a folder you were sure was gone
              </span>
              <span className="text-glow-gradient block font-bold">
                it was sitting there the whole time.
              </span>
            </p>

            <p className="mt-5 text-sm text-ink-soft">
              Found something instead?{" "}
              <Link
                href="/report"
                className="font-bold text-ink underline underline-offset-4 hover:text-glow"
              >
                Report an item
              </Link>
            </p>
          </div>

          {/*
            Ok butonu — klasörle aynı yere gider. Sağına akan kesik çizgi bir
            iz ekledik: ok ile klasör arasındaki ilişki daha önce
            okunmuyordu, şimdi "buradan oraya" gözle takip ediliyor.
          */}
          <div className="relative flex justify-center">
            <Link
              href="/browse"
              className="glass-base glass-accent group flex size-14 items-center justify-center rounded-full text-on-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glow xl:size-20"
              aria-label="Open the lost and found"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/*
            İz, ok ile klasör arasındaki boşluğu tam dolduruyor. Sabit
            genişlik yerine flex-1: kolon genişliği viewport'a göre
            değiştiği için ancak böyle her boyutta klasöre kadar uzanıyor.
          */}
          <div className="flex items-center md:justify-end">
            <span aria-hidden className="trail hidden h-px flex-1 md:block" />
            <AnimatedFolder
              items={LANDING_ITEMS}
              label="Open the lost and found"
              className="scale-90 xl:scale-100"
            />
          </div>
        </main>

        {/*
          Alt şerit: üç adım, üstlerinden geçen bir ray ile bağlı.
          Ray kenarlarda saydamlaşarak bitiyor — çerçeve gibi değil, akış gibi
          okunsun diye. Ray ve düğümler dekoratif, ekran okuyucu listeyi
          olduğu gibi okuyor.
        */}
        <ol className="relative mx-auto grid w-full max-w-6xl shrink-0 gap-3 pt-5 sm:grid-cols-3">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[7px] right-[16.66%] left-[16.66%] hidden h-px sm:block"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgb(255 255 255 / 0.35) 18%, rgb(255 255 255 / 0.35) 82%, transparent)",
          }}
        />

        {STEPS.map((step) => (
          <li key={step.number} className="relative">
            {/* Ray üzerindeki düğüm ve karta inen sap */}
            <span
              aria-hidden
              className="absolute -top-5 left-1/2 hidden size-[9px] -translate-x-1/2 rounded-full bg-glow shadow-[0_0_10px_2px_rgb(34_211_238_/_0.5)] sm:block"
            />
            <span
              aria-hidden
              className="absolute -top-[11px] left-1/2 hidden h-[11px] w-px -translate-x-1/2 bg-white/25 sm:block"
            />

            {/*
              Hiyerarşi: numara (siyan, küçük) → başlık (iri ve extrabold) →
              gövde. Önceden başlık ile gövde neredeyse aynı ağırlıktaydı,
              "Report/Browse/Claim" başlık olduğu okunmuyordu.
            */}
            <div className="glass-card h-full rounded-2xl px-5 py-4">
              <span className="text-sm font-extrabold tracking-widest text-glow">
                {step.number}
              </span>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-ink">
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-snug font-medium text-ink-soft">
                {step.body}
              </p>
            </div>
          </li>
        ))}
        </ol>
      </div>
    </div>
  );
}
