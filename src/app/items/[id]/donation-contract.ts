/**
 * Community Shelf başvuru formunun sabitleri ve durum tipi.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * NEDEN AYRI DOSYA: actions.ts "use server" ile işaretli ve böyle bir modül
 * yalnızca async fonksiyon export edebilir — bkz. claim-contract.ts'deki
 * aynı not. Sabit veya tip export edilirse client import'u çalışma anında
 * patlar, TypeScript bu kuralı bilmiyor.
 */

/** donation_requests.message check constraint'i ile aynı: 10-1000 karakter. */
export const DONATION_MESSAGE_MIN = 10;
export const DONATION_MESSAGE_MAX = 1000;

export type DonationRequestFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const DONATION_REQUEST_INITIAL_STATE: DonationRequestFormState = {
  status: "idle",
  message: "",
};
