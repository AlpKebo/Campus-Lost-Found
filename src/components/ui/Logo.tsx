/**
 * Marka işareti (bulunan eşyaya bağlanan kartonet etiket) ve kelime markası.
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
          x1="6"
          y1="4"
          x2="26"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      <g transform="rotate(-18 16 16)">
        {/* İp */}
        <path
          d="M16.4 9.5C16.4 5.4 13.4 3.2 10.2 4.4"
          fill="none"
          stroke="#c9bede"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Etiket gövdesi */}
        <rect
          x="9.6"
          y="7.4"
          width="13.6"
          height="20.2"
          rx="3.4"
          fill="url(#logo-mark)"
        />
        {/* Delik */}
        <circle cx="16.4" cy="11.6" r="1.9" fill="#140e22" />
      </g>
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
