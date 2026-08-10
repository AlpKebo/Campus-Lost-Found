import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  assertSupabaseConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database, Profile } from "@/types/database";

/**
 * Server Component, Server Action ve Route Handler'lar için Supabase client'ı.
 * Her istekte yeniden oluşturulmalıdır — global bir değişkende tutma.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component içinden cookie yazılamaz. Session yenilemesi
          // proxy'de yapıldığı için burada yutmak güvenli.
        }
      },
    },
  });
}

/**
 * Giriş yapmış kullanıcıyı döner, yoksa null.
 * getUser() token'ı Supabase'e doğrulatır; getSession()'dan güvenlidir.
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Giriş yapmış kullanıcının profilini döner.
 * name alanı null ise kullanıcı henüz /profile-setup adımını tamamlamamıştır.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}
