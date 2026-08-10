"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";
import { FieldError, FormError, Input, Label } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 80;

export function ProfileSetupForm({
  userId,
  email,
  next,
}: {
  userId: string;
  email: string;
  next: string;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < MIN_NAME_LENGTH) {
      return `Your name must be at least ${MIN_NAME_LENGTH} characters.`;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      return `Your name can be at most ${MAX_NAME_LENGTH} characters.`;
    }
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validationError = validate(name);
    setFieldError(validationError);
    if (validationError) return;

    setLoading(true);
    const supabase = createClient();

    // upsert: profiles satırı normalde auth trigger'ı ile açılır, ama satır
    // bir sebeple yoksa burada oluşturulur. Email Supabase Auth'tan gelir,
    // kullanıcıdan istenmez (brief bölüm 2).
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, email, name: name.trim() }, { onConflict: "id" });

    if (error) {
      setFormError(error.message);
      setLoading(false);
      return;
    }

    // refresh(): Navbar server component'i yeni ismi göstersin.
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      {formError && <FormError>{formError}</FormError>}

      <div>
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          autoFocus
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          placeholder="Alex Morgan"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (fieldError) setFieldError(validate(event.target.value));
          }}
          disabled={loading}
          aria-invalid={fieldError ? true : undefined}
        />
        <FieldError>{fieldError}</FieldError>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} disabled readOnly />
        <p className="mt-1.5 text-sm text-ink-soft">
          Taken from the account you signed in with. It can&apos;t be changed.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Spinner />}
        Save and continue
      </Button>
    </form>
  );
}
