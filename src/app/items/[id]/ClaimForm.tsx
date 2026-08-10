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
          <Spinner /> Gönderiliyor
        </>
      ) : (
        "Claim gönder"
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
        <Label htmlFor="message">Bu eşyanın senin olduğunu nasıl biliyoruz?</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={MESSAGE_MIN}
          maxLength={MESSAGE_MAX}
          placeholder="Eşyanın ayırt edici bir özelliğini yaz — üzerindeki çizik, içindeki not, kılıfının rengi gibi."
          aria-describedby="message-help"
        />
        <p
          id="message-help"
          className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400"
        >
          En az {MESSAGE_MIN} karakter. Bu mesajı yalnızca ilan sahibi görür.
        </p>
        {state.status === "error" && <FieldError>{state.message}</FieldError>}
      </div>

      <SubmitButton />
    </form>
  );
}
