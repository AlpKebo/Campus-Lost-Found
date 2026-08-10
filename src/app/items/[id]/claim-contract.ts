/**
 * Claim formunun sabitleri ve durum tipi.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * NEDEN AYRI DOSYA: actions.ts "use server" ile işaretli ve böyle bir modül
 * yalnızca async fonksiyon export edebilir. Sabit veya tip export edilirse
 * bundler modülü "hiç export'u yok" sayar ve client import'u patlar.
 * TypeScript bu kuralı bilmiyor, hata ancak çalışma anında çıkıyor.
 */

/** claims.message check constraint'i ile aynı: 10-1000 karakter. */
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 1000;

export type ClaimFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const CLAIM_INITIAL_STATE: ClaimFormState = {
  status: "idle",
  message: "",
};
