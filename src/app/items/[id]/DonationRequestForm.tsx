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

import { submitDonationRequest } from "./actions";
import {
  DONATION_MESSAGE_MAX,
  DONATION_MESSAGE_MIN,
  DONATION_REQUEST_INITIAL_STATE,
} from "./donation-contract";

/**
 * Community Shelf başvuru formu — ilan sahibine gönderilecek "neden bana
 * lazım" mesajı.
 *
 * SAHİBİ: student2 (Discover & Claim).
 */

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? (
        <>
          <Spinner /> Sending
        </>
      ) : (
        "Request this item"
      )}
    </Button>
  );
}

export function DonationRequestForm({ itemId }: { itemId: string }) {
  const [state, formAction] = useActionState(
    submitDonationRequest.bind(null, itemId),
    DONATION_REQUEST_INITIAL_STATE,
  );

  if (state.status === "success") {
    return <FormSuccess>{state.message}</FormSuccess>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <Label htmlFor="donation-message">Why do you need this?</Label>
        <Textarea
          id="donation-message"
          name="message"
          required
          minLength={DONATION_MESSAGE_MIN}
          maxLength={DONATION_MESSAGE_MAX}
          placeholder="No one has claimed this in over a month. Tell the owner why you could use it."
          aria-describedby="donation-message-help"
        />
        <p id="donation-message-help" className="mt-1.5 text-xs text-ink-soft">
          At least {DONATION_MESSAGE_MIN} characters. Only the listing owner sees this message.
        </p>
        {state.status === "error" && <FieldError>{state.message}</FieldError>}
      </div>

      <SubmitButton />
    </form>
  );
}
