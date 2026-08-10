import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * .env.local doldurulmadığı sürece görünen kurulum uyarısı.
 * Supabase bağlandıktan sonra kendiliğinden kaybolur.
 */
export function SetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-8 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-left text-sm backdrop-blur-md">
      <p className="font-semibold text-amber-200">Supabase isn&apos;t connected yet</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-100/80">
        <li>Create a new project on supabase.com.</li>
        <li>
          Run{" "}
          <code className="rounded bg-amber-300/15 px-1 py-0.5 font-mono text-xs">
            supabase/schema.sql
          </code>{" "}
          in the SQL Editor.
        </li>
        <li>
          Run{" "}
          <code className="rounded bg-amber-300/15 px-1 py-0.5 font-mono text-xs">
            cp .env.example .env.local
          </code>{" "}
          and fill in your URL and anon key.
        </li>
        <li>Restart the dev server.</li>
      </ol>
    </div>
  );
}
