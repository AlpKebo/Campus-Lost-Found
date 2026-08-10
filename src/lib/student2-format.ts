/**
 * student2 (Discover & Claim) sayfalarının paylaştığı biçimlendirme
 * yardımcıları. Dosya adı bilerek student2 ile başlıyor: src/lib ortak bir
 * klasör, aynı isimde iki dosya açılırsa merge conflict çıkar.
 */

const MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

/**
 * "2026-08-10" → "10 Ağu 2026".
 *
 * Intl yerine sabit liste: server ve client aynı çıktıyı vermezse React
 * hydration uyarısı basar, tarih formatı da tarayıcı diline göre kayar.
 */
export function formatItemDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return value;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** "2026-08-10T09:31:00Z" → "10 Ağu 2026". */
export function formatTimestamp(value: string): string {
  return formatItemDate(value.slice(0, 10));
}
