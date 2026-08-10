"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card, Spinner } from "@/components/ui/Feedback";
import { FormError, FormSuccess, Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

/**
 * Magic Link login.
 *
 * SAHİBİ: student1 (brief bölüm 2). Ortak setup'ta çalışır bir temel
 * bırakıldı — student2'nin claim akışı login'e bağlı olduğu için burası
 * baştan çalışır durumda olmalı. Geliştirmesi student1 branch'inde yapılır.
 */
function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (signInError) {
      setError(signInError.message);
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <Card className="p-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Login
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          E-posta adresini gir, sana giriş linki gönderelim. Şifre gerekmiyor.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {callbackError && (
            <FormError>
              Giriş linki doğrulanamadı. Link süresi dolmuş olabilir, tekrar dene.
            </FormError>
          )}
          {error && <FormError>{error}</FormError>}
          {status === "sent" && (
            <FormSuccess>
              Giriş linki <strong>{email}</strong> adresine gönderildi.
              E-postandaki linke tıkla.
            </FormSuccess>
          )}

          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ornek@ogrenci.edu.tr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "loading" || status === "sent"}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading" || status === "sent"}
          >
            {status === "loading" && <Spinner />}
            {status === "sent" ? "Link gönderildi" : "Magic Link gönder"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
