import { createBrowserClient } from "@supabase/ssr";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Client Component'ler için Supabase client'ı.
 * "use client" olan dosyalarda kullanılır.
 */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}
