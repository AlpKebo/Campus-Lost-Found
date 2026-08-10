import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * .env.local doldurulmadığı sürece görünen kurulum uyarısı.
 * Supabase bağlandıktan sonra kendiliğinden kaybolur.
 */
export function SetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-sm dark:border-amber-900 dark:bg-amber-950">
      <p className="font-medium text-amber-900 dark:text-amber-100">
        Supabase henüz bağlı değil
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-800 dark:text-amber-200">
        <li>supabase.com üzerinde yeni bir proje aç.</li>
        <li>
          SQL Editor&apos;da{" "}
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900">
            supabase/schema.sql
          </code>{" "}
          dosyasını çalıştır.
        </li>
        <li>
          <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900">
            cp .env.example .env.local
          </code>{" "}
          yapıp URL ve anon key değerlerini doldur.
        </li>
        <li>Dev server&apos;ı yeniden başlat.</li>
      </ol>
    </div>
  );
}
