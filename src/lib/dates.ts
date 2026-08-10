/**
 * Tarih yardımcıları.
 *
 * SAHİBİ: student1. items.item_date bir "date" kolonu, yani saat/timezone
 * taşımaz — "2026-08-10" gibi. new Date("2026-08-10") bunu UTC gece yarısı
 * sayar ve negatif offset'li timezone'larda bir gün geriye kayar. O yüzden
 * hem üretirken hem gösterirken string parçalarıyla çalışıyoruz.
 */

/** Bugünün yerel tarihi, "YYYY-MM-DD". Form input'unda max değeri olarak. */
export function todayISODate(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Site İngilizce; ay adlarını sabit tutuyoruz (bkz. student2-format.ts). */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2026-08-10" -> "Aug 10, 2026" */
export function formatItemDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  const name = MONTHS[Number(month) - 1];
  if (!name) return isoDate;
  return `${name} ${Number(day)}, ${year}`;
}
