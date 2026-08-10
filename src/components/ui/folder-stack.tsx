"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { LandingItem } from "@/lib/landing-items.generated";

/**
 * Landing'deki 3B klasör.
 *
 * Hover: kapak öne devrilir, içinden üç kart çıkıp yelpaze açar.
 * Tıklama: klasördeki bütün ürünler ekrana saçılır, sonra /browse açılır.
 *
 * Kaynak bileşen shadcn token'ları ve bir lightbox galerisi ile geliyordu.
 * Bu proje shadcn değil; renkler projenin token'larına bağlandı, galeri de
 * kaldırıldı (etkileşim "klasörü aç ve listeye geç"). Böylece lucide-react
 * bağımlılığı gerekmiyor.
 */

/** Yelpazedeki üç kartın açı ve yatay kaymaları. */
const FAN_ROTATION = [-14, 0, 14];
const FAN_TRANSLATION = [-72, 0, 72];

/**
 * Saçılma hedefleri: viewport yüzdesi + açı + gecikme.
 *
 * Rastgele üretmiyoruz — sabit tablo, kartların üst üste binmemesini ve
 * ekranın her köşesine dağılmasını garanti ediyor. Orta bant (%40-60 yatay,
 * %35-60 dikey) bilerek boş: başlık ve buton orada duruyor.
 */
const SCATTER = [
  { x: 8, y: 16, r: -18, d: 0 },
  { x: 22, y: 40, r: 12, d: 40 },
  { x: 12, y: 70, r: -8, d: 80 },
  { x: 30, y: 86, r: 16, d: 120 },
  { x: 46, y: 14, r: -12, d: 30 },
  { x: 62, y: 26, r: 20, d: 70 },
  { x: 54, y: 84, r: -16, d: 110 },
  { x: 72, y: 62, r: 10, d: 50 },
  { x: 88, y: 22, r: -22, d: 90 },
  { x: 92, y: 52, r: 14, d: 20 },
  { x: 80, y: 88, r: -10, d: 130 },
  { x: 38, y: 62, r: 18, d: 150 },
  { x: 4, y: 44, r: 8, d: 60 },
  { x: 66, y: 6, r: -14, d: 100 },
];

/**
 * Saçılma süresi. Kısa tutuldu: istenen his "patlasın ve hemen geçilsin".
 * Kartlar hedeflerine varır varmaz /browse açılıyor, bekleme yok.
 */
const SCATTER_MS = 520;

type Phase = "idle" | "scattering";

export function AnimatedFolder({
  items,
  href = "/browse",
  label,
  className,
}: {
  items: LandingItem[];
  href?: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  /** Kartların klasörden çıkıyormuş gibi başlaması için doğduğu nokta. */
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    router.prefetch(href);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router, href]);

  function open() {
    if (phase !== "idle") return;

    // Kartların doğduğu nokta: klasörün ekrandaki merkezi.
    const rect = folderRef.current?.getBoundingClientRect();
    if (rect) {
      setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setPhase("scattering");
    timerRef.current = setTimeout(() => router.push(href), SCATTER_MS);
  }

  const peek = items.slice(0, 3);
  const cardsOut = isHovered || phase === "scattering";

  return (
    <>
      <div
        ref={folderRef}
        role="link"
        tabIndex={0}
        aria-label={label}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-3xl",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
          "focus-visible:outline-glow",
          className,
        )}
        style={{ perspective: "1000px" }}
      >
        {/* Klasörün altındaki yumuşak ışık */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at 50% 65%, var(--color-violet) 0%, transparent 68%)",
            opacity: cardsOut ? 0.32 : 0.15,
            filter: "blur(18px)",
          }}
        />

        <div
          className="relative flex items-center justify-center"
          style={{ height: "190px", width: "230px" }}
        >
          {/* Arka kapak */}
          <div
            aria-hidden
            className="absolute h-24 w-32 rounded-lg bg-folder-back shadow-md"
            style={{
              transformOrigin: "bottom center",
              transform: cardsOut ? "rotateX(-15deg)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Sekme */}
          <div
            aria-hidden
            className="absolute h-4 w-12 rounded-t-md bg-folder-tab"
            style={{
              top: "calc(50% - 48px - 12px)",
              left: "calc(50% - 64px + 16px)",
              transformOrigin: "bottom center",
              transform: cardsOut
                ? "rotateX(-25deg) translateY(-2px)"
                : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />

          {/* Hover yelpazesi — saçılma başlayınca gizlenir, yerini overlay alır. */}
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 20,
              opacity: phase === "scattering" ? 0 : 1,
            }}
          >
            {peek.map((item, index) => (
              <PeekCard
                key={item.slug}
                item={item}
                index={index}
                isOut={isHovered && phase === "idle"}
              />
            ))}
          </div>

          {/* Ön kapak */}
          <div
            aria-hidden
            className="absolute h-24 w-32 rounded-lg bg-folder-front shadow-lg"
            style={{
              top: "calc(50% - 48px + 4px)",
              transformOrigin: "bottom center",
              transform: cardsOut
                ? "rotateX(25deg) translateY(8px)"
                : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 30,
            }}
          />

          {/* Kapağa vuran ışık */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-24 w-32 overflow-hidden rounded-lg"
            style={{
              top: "calc(50% - 48px + 4px)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 55%)",
              transformOrigin: "bottom center",
              transform: cardsOut
                ? "rotateX(25deg) translateY(8px)"
                : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 31,
            }}
          />
        </div>

        {/*
          Düz metin olarak zeminde kayboluyordu; cam hap + tam kontrastlı
          metin yaptık. Birincil eylem ("Click to open") kalın ve beyaz,
          ikincil ipucu daha sönük — hangisinin asıl davet olduğu belli olsun.
        */}
        <div
          className="glass-base glass-clear mt-3 rounded-full px-4 py-1.5 transition-opacity duration-300"
          style={{ opacity: cardsOut ? 0 : 1 }}
        >
          <p className="text-sm font-bold whitespace-nowrap text-ink">
            Click to open
            <span className="ml-1.5 font-medium text-ink-faint">
              · hover to peek
            </span>
          </p>
        </div>
      </div>

      {phase === "scattering" && origin && (
        <ScatterOverlay items={items} origin={origin} />
      )}
    </>
  );
}

/** Klasörün üstünde yelpaze açan üç kart. */
function PeekCard({
  item,
  index,
  isOut,
}: {
  item: LandingItem;
  index: number;
  isOut: boolean;
}) {
  return (
    <div
      aria-hidden
      className="absolute h-28 w-20 overflow-hidden rounded-lg border border-white/20 bg-surface shadow-xl"
      style={{
        transform: isOut
          ? `translateY(-76px) translateX(${FAN_TRANSLATION[index]}px) rotate(${FAN_ROTATION[index]}deg) scale(1)`
          : "translateY(0px) translateX(0px) rotate(0deg) scale(0.5)",
        opacity: isOut ? 1 : 0,
        transition: `all 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 80}ms`,
        zIndex: 10 - index,
        left: "-40px",
        top: "-56px",
      }}
    >
      <Image src={item.src} alt="" fill sizes="80px" className="object-cover" />
    </div>
  );
}

/**
 * Tıklamadan sonra ekranın tamamına saçılan ürünler.
 *
 * Tam ekran, tıklama geçirmeyen bir katman. Her kart nihai konumuna
 * yerleştiriliyor; `scatter-in` keyframe'i onu klasörün merkezinden
 * (--dx/--dy kadar ötelenmiş halden) yerine uçuruyor.
 */
function ScatterOverlay({
  items,
  origin,
}: {
  items: LandingItem[];
  origin: { x: number; y: number };
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {items.map((item, index) => {
        const spot = SCATTER[index % SCATTER.length]!;

        // Kartın nihai merkezinin piksel karşılığı — başlangıç ötelemesi
        // bundan hesaplanıyor. Overlay yalnızca tıklamadan sonra (client'ta)
        // mount olduğu için window'a bakmak güvenli.
        const targetX = (window.innerWidth * spot.x) / 100;
        const targetY = (window.innerHeight * spot.y) / 100;

        return (
          <div
            key={item.slug}
            className="scatter-card absolute h-36 w-26 overflow-hidden rounded-xl border border-white/20 shadow-2xl"
            style={
              {
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                "--dx": `${origin.x - targetX}px`,
                "--dy": `${origin.y - targetY}px`,
                "--r": `${spot.r}deg`,
                "--dur": `${SCATTER_MS - spot.d}ms`,
                "--delay": `${spot.d}ms`,
              } as CSSProperties
            }
          >
            <Image
              src={item.src}
              alt=""
              fill
              sizes="104px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <p className="absolute right-2 bottom-1.5 left-2 truncate text-[11px] font-semibold text-white">
              {item.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
