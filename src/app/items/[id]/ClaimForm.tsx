"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import {
  FieldError,
  FormSuccess,
  Label,
  Textarea,
} from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Feedback";

import { submitClaim } from "./actions";
import {
  CLAIM_INITIAL_STATE,
  MESSAGE_MAX,
  MESSAGE_MIN,
} from "./claim-contract";

/**
 * "Bu benim" formu — ilan sahibine gönderilecek kanıt mesajı.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Sending
        </>
      ) : (
        "Send claim"
      )}
    </Button>
  );
}

export function ClaimForm({ itemId }: { itemId: string }) {
  const [state, formAction] = useActionState(
    submitClaim.bind(null, itemId),
    CLAIM_INITIAL_STATE,
  );

  if (state.status === "success") {
    return <FormSuccess>{state.message}</FormSuccess>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="message">How do we know this item is yours?</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          placeholder="Describe something only the owner would know — a scratch on it, a note inside, the colour of its case."
          aria-describedby="message-help"
        />
        <p
          id="message-help"
          className="mt-1.5 text-xs text-ink-soft"
        >
          At least {MESSAGE_MIN} characters. Only the listing owner sees this message.
        </p>
        {state.status === "error" && <FieldError>{state.message}</FieldError>}
      </div>

      <SubmitButton />
    </form>
  );
}
