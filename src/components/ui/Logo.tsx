/**
 * Marka işareti (kapağı açık kayıp eşya kutusu) ve kelime markası.
 *
 * Aynı çizim src/app/icon.svg içinde favicon olarak da duruyor. İkisini tek
 * dosyadan beslemek yerine kopyalamak bilinçli: icon.svg Next'in metadata
 * dosya konvansiyonu, bir React bileşeninden import edilemiyor. Birini
 * değiştirirsen diğerini de güncelle.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className ?? "size-7"}
    >
      <defs>
        <linearGradient
          id="logo-mark"
          x1="4"
          y1="6"
          x2="27"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      <path d="M3.5 11.5 8 6.5h16l4.5 5z" fill="url(#logo-mark)" opacity="0.65" />
      <path
        d="M4.5 12.5h23V25a3 3 0 0 1-3 3h-17a3 3 0 0 1-3-3z"
        fill="url(#logo-mark)"
      />
      <rect x="12.6" y="12.5" width="6.8" height="5" rx="1.6" fill="#140e22" />
    </svg>
  );
}

/** İşaret + "Campus Lost & Found" yazısı. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <LogoMark className="size-7 shrink-0 transition-transform group-hover:-rotate-6" />
      <span className="text-lg font-extrabold tracking-tight text-ink">
        Campus Lost &amp; Found
      </span>
    </span>
  );
}
