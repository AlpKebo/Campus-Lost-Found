import type {
  ClaimStatus,
  ItemCategory,
  ItemStatus,
  ItemType,
} from "@/types/database";

/**
 * ORTAK DOSYA — student1 (Report formu) ve student2 (Browse filtreleri)
 * aynı listeleri kullanır. Değiştirmeden önce karşı tarafa haber ver.
 */

export const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: "lost", label: "Lost" },
  { value: "found", label: "Found" },
];

export const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "wallet_money", label: "Wallet / Money" },
  { value: "keys", label: "Keys" },
  { value: "bag", label: "Bag" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "id_cards", label: "ID / Cards" },
  { value: "accessories", label: "Accessories" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABELS: Record<ItemCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<ItemCategory, string>;

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  open: "Open",
  claimed: "Claimed",
  returned: "Returned",
  closed: "Closed",
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

/**
 * Browse sayfasında görünen statüler — yalnızca "open".
 *
 * "claimed" bilerek listede değil: bir ilan claim edildiği anda iş bitmiş
 * sayılır, listede kalması hem aramayı kirletiyor hem de kullanıcıyı
 * claim gönderemeyeceği bir ilana götürüyordu. Sahibi ilanını her statüde
 * My Listings'te görmeye devam eder (items_select_public policy'si).
 */
export const BROWSABLE_STATUSES: ItemStatus[] = ["open"];

/**
 * Community Shelf — bir "found" ilan bu kadar gün boyunca claim almazsa
 * ihtiyacı olanların başvurusuna açılır. Aynı sayı supabase/community_shelf.sql
 * içindeki shelf_items view'ında da var; ikisi birlikte değişmeli.
 */
export const SHELF_DAYS = 30;

/** Supabase Storage bucket adı. */
export const ITEM_IMAGES_BUCKET = "item-images";

/** Görsel yükleme kuralları — brief: JPG / JPEG / PNG, max 5 MB. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

/** Login gerektiren route'lar — middleware bu listeye bakar. */
export const PROTECTED_ROUTES = [
  "/report",
  "/my-listings",
  "/sent-claims",
  "/requests",
  "/profile-setup",
];
