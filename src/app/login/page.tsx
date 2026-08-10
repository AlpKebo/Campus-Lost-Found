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
        <h1 className="text-xl font-bold text-ink">Log in</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enter your email and we&apos;ll send you a sign-in link. No password
          needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {callbackError && (
            <FormError>
              We couldn&apos;t verify that sign-in link. It may have expired —
              please try again.
            </FormError>
          )}
          {error && <FormError>{error}</FormError>}
          {status === "sent" && (
            <FormSuccess>
              A sign-in link has been sent to <strong>{email}</strong>. Click the
              link in your inbox.
            </FormSuccess>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@student.edu"
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
            {status === "sent" ? "Link sent" : "Send magic link"}
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
