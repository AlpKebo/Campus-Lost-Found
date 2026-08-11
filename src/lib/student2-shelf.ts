import { SHELF_DAYS } from "@/lib/constants";
import type { Item } from "@/types/database";

/**
 * Community Shelf uygunluk kontrolü — student2 (Discover & Claim).
 *
 * Dosya adı bilerek student2 ile başlıyor: src/lib ortak bir klasör, aynı
 * isimde iki dosya açılırsa merge conflict çıkar.
 *
 * Bir "found" ilan SHELF_DAYS gündür açıksa (item_date'ten itibaren) rafa
 * düşer: sahibi bulunamamış demektir, ihtiyacı olan başvurabilir.
 *
 * Bu saf bir tarih hesabı — aktif claim kontrolü YOK. Asıl kural
 * supabase/community_shelf.sql'deki donation_requests_insert_own policy'sinde:
 * üzerinde pending/accepted bir claim varsa başvuru orada reddedilir. Burada
 * ikinci bir sorgu atmamak için (Browse login gerektirmeyen public bir sayfa)
 * bilerek basit tutuluyor — nadir rastlanan bu kesişim durumunda kullanıcı
 * "Request" gönderdiğinde RLS'ten dönen dostane hatayı görür.
 */
export function isShelfEligible(item: Pick<Item, "type" | "status" | "item_date">): boolean {
  if (item.type !== "found" || item.status !== "open") return false;
  return daysSinceItemDate(item.item_date) >= SHELF_DAYS;
}

/** "2026-08-10" -> bugüne kaç gün var. Negatif olamaz (gelecekteki tarih yok). */
function daysSinceItemDate(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return 0;

  // UTC gece yarısı kullan: hem item_date hem "bugün" aynı referansla
  // hesaplanmalı, yoksa timezone'a göre off-by-one gün kayabilir.
  const itemUTC = Date.UTC(year, month - 1, day);
  const now = new Date();
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.floor((todayUTC - itemUTC) / (1000 * 60 * 60 * 24));
}

/** Bugünden SHELF_DAYS gün öncesi, "YYYY-MM-DD" — Browse'un shelf filtresinde kullanılır. */
export function shelfCutoffDate(): string {
  const now = new Date();
  const cutoff = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - SHELF_DAYS));
  return [
    cutoff.getUTCFullYear(),
    String(cutoff.getUTCMonth() + 1).padStart(2, "0"),
    String(cutoff.getUTCDate()).padStart(2, "0"),
  ].join("-");
}
