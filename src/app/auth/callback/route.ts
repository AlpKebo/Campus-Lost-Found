import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Magic link callback.
 *
 * ORTAK DOSYA — auth plumbing. Kullanıcı e-postasındaki linke tıklayınca
 * buraya döner; kod session'a çevrilir.
 *
 * Profilinde name yoksa /profile-setup sayfasına yönlendirilir
 * (student1 brief bölüm 2).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.name) {
      const setupUrl = new URL("/profile-setup", origin);
      setupUrl.searchParams.set("next", next);
      return NextResponse.redirect(setupUrl);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
