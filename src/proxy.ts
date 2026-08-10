import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next.js 16'da eski "middleware" dosya adının yerini "proxy" aldı.
 * Her istekte Supabase session'ını tazeler.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Statik dosyalar ve görseller hariç her isteği yakala.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
