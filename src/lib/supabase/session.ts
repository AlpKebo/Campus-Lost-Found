import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { PROTECTED_ROUTES } from "@/lib/constants";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Her istekte Supabase session'ını tazeler ve korumalı route'ları
 * login olmayan kullanıcılara kapatır. src/proxy.ts tarafından çağrılır.
 *
 * ORTAK DOSYA — iki branch de buna güveniyor.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // .env.local doldurulmadıysa auth kontrolü yapılamaz; istek olduğu gibi geçer.
  if (!isSupabaseConfigured) return supabaseResponse;

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getUser() çağrısı ile createServerClient arasına kod koyma —
  // session yenilenmezse kullanıcı rastgele logout olur.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Login sonrası kullanıcıyı gitmek istediği sayfaya geri gönder.
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
