/**
 * Supabase environment değişkenleri tek yerden okunur.
 *
 * .env.local henüz doldurulmadıysa uygulama çökmez; Navbar ve landing page
 * "kurulum eksik" durumunu gösterir. Böylece Supabase projesi açılmadan önce
 * de `npm run dev` ile localhost kontrol edilebilir.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export const MISSING_ENV_MESSAGE =
  "Supabase environment variables are missing. Copy .env.example to .env.local " +
  "and fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";

/** Supabase client oluşturmadan önce çağrılır. */
export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(MISSING_ENV_MESSAGE);
  }
}
