import type { ReactNode } from "react";

/**
 * GEÇİCİ SAYFA — ikon seçilir seçilmez silinecek.
 *
 * Altı aday, hepsi gerçek hayattaki bir kayıp eşya nesnesi (klasör yok).
 * Her aday üç boyutta gösteriliyor: 96px (marka), 32px (navbar) ve 16px
 * (favicon). Bir ikonun iyi olup olmadığı ancak 16px'te belli oluyor.
 */

const GRAD = (
  <defs>
    <linearGradient
      id="g"
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
);

const CANDIDATES: { id: string; name: string; note: string; art: ReactNode }[] =
  [
    {
      id: "1",
      name: "Kartonet etiket",
      note: "Kayıp eşya bürosunda teslim edilen her şeye bağlanan ipli etiket.",
      art: (
        <>
          {GRAD}
          <g transform="rotate(-18 16 16)">
            <path
              d="M16.4 9.5C16.4 5.4 13.4 3.2 10.2 4.4"
              fill="none"
              stroke="#c9bede"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="9.6"
              y="7.4"
              width="13.6"
              height="20.2"
              rx="3.4"
              fill="url(#g)"
            />
            <circle cx="16.4" cy="11.6" r="1.9" fill="#140e22" />
          </g>
        </>
      ),
    },
    {
      id: "2",
      name: "Tezgâh zili",
      note: "Kayıp eşya bürosunun bankosundaki çıngırak. 'Birine sor, bulunur.'",
      art: (
        <>
          {GRAD}
          <rect x="3" y="24" width="26" height="4" rx="2" fill="url(#g)" />
          <path d="M6.5 24a9.5 9.5 0 0 1 19 0z" fill="url(#g)" />
          <rect x="14.6" y="4.5" width="2.8" height="4" rx="1.4" fill="url(#g)" />
          <circle cx="16" cy="4" r="2.6" fill="url(#g)" />
        </>
      ),
    },
    {
      id: "3",
      name: "Anahtar",
      note: "Kampüste en çok kaybedilen şey. Silüeti en tanıdık olan aday.",
      art: (
        <>
          {GRAD}
          <g transform="rotate(-45 16 16)">
            <circle
              cx="16"
              cy="9"
              r="5.6"
              fill="none"
              stroke="url(#g)"
              strokeWidth="3.4"
            />
            <path
              d="M16 14.8V27"
              stroke="url(#g)"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <path
              d="M16 21h5M16 25h3.6"
              stroke="url(#g)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
        </>
      ),
    },
    {
      id: "4",
      name: "Kayıp eşya kutusu",
      note: "Kapağı açık karton kutu — okulların koridorundaki o kutu.",
      art: (
        <>
          {GRAD}
          <path d="M3.5 11.5 8 6.5h16l4.5 5z" fill="url(#g)" opacity="0.65" />
          <path
            d="M4.5 12.5h23V25a3 3 0 0 1-3 3h-17a3 3 0 0 1-3-3z"
            fill="url(#g)"
          />
          <rect x="12.6" y="12.5" width="6.8" height="5" rx="1.6" fill="#140e22" />
        </>
      ),
    },
    {
      id: "5",
      name: "Raptiyeli not",
      note: "Kampüs ilan panosuna iğnelenmiş kayıp ilanı. Ürünle birebir örtüşür.",
      art: (
        <>
          {GRAD}
          <g transform="rotate(-8 16 17)">
            <rect x="6.5" y="8" width="19" height="20" rx="2.6" fill="url(#g)" />
            <path
              d="M11 17h10M11 21h7"
              stroke="#140e22"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            />
          </g>
          <circle cx="16" cy="7" r="3.2" fill="#c9bede" />
          <circle cx="16" cy="7" r="1.2" fill="#140e22" />
        </>
      ),
    },
    {
      id: "6",
      name: "Şemsiye",
      note: "Kayıp eşya denince akla gelen klasik nesne. En oyuncu aday.",
      art: (
        <>
          {GRAD}
          <path d="M2.5 16a13.5 13.5 0 0 1 27 0z" fill="url(#g)" />
          <path
            d="M16 16v8.5a3.5 3.5 0 0 1-7 0"
            fill="none"
            stroke="url(#g)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ),
    },
  ];

function Icon({ art, size }: { art: ReactNode; size: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      {art}
    </svg>
  );
}

export default function IconLabPage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-extrabold text-ink">İkon adayları</h1>
      <p className="mt-2 text-base font-medium text-ink-soft">
        Her satır: 96px (marka) · 32px (navbar) · 16px (favicon). Karar 16px
        sütununa bakılarak verilmeli.
      </p>

      <ul className="mt-8 space-y-3">
        {CANDIDATES.map((candidate) => (
          <li
            key={candidate.id}
            className="glass-card flex items-center gap-6 rounded-2xl px-6 py-5"
          >
            <div className="flex w-56 shrink-0 items-end gap-5">
              <Icon art={candidate.art} size={96} />
              <Icon art={candidate.art} size={32} />
              <Icon art={candidate.art} size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xl font-extrabold text-ink">
                {candidate.id}. {candidate.name}
              </p>
              <p className="mt-1 text-sm font-medium text-ink-soft">
                {candidate.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
