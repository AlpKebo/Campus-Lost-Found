/**
 * supabase/schema.sql ile birebir eşleşen tip tanımları.
 *
 * ORTAK DOSYA — student1 ve student2 birlikte kullanır.
 * Şema değişirse bu dosya da güncellenmeli ve karşı tarafa haber verilmeli.
 */

export type ItemType = "lost" | "found";

export type ItemStatus = "open" | "claimed" | "returned" | "closed";

export type ClaimStatus = "pending" | "accepted" | "rejected";

export type ItemCategory =
  | "electronics"
  | "wallet_money"
  | "keys"
  | "bag"
  | "clothing"
  | "books"
  | "id_cards"
  | "accessories"
  | "other";

export type Profile = {
  id: string;
  email: string;
  /** İlk girişte null olur; kullanıcı /profile-setup sayfasında doldurur. */
  name: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  owner_id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  /** date — "YYYY-MM-DD" */
  item_date: string;
  image_url: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
};

export type Claim = {
  id: string;
  item_id: string;
  claimant_id: string;
  message: string;
  status: ClaimStatus;
  created_at: string;
};

/** public.received_claims() dönüş satırı — student1 kullanır. */
export type ReceivedClaim = {
  claim_id: string;
  item_id: string;
  claimant_name: string | null;
  /** Yalnızca claim accepted ise dolu gelir. */
  claimant_email: string | null;
  message: string;
  status: ClaimStatus;
  created_at: string;
};

/** public.sent_claims() dönüş satırı — student2 kullanır. */
export type SentClaim = {
  claim_id: string;
  item_id: string;
  item_title: string;
  item_image_url: string;
  item_location: string;
  item_type: ItemType;
  message: string;
  status: ClaimStatus;
  created_at: string;
  /** Yalnızca claim accepted ise dolu gelir. */
  owner_name: string | null;
  /** Yalnızca claim accepted ise dolu gelir. */
  owner_email: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, "id" | "email"> & Partial<Omit<Profile, "id" | "email">>;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      items: {
        Row: Item;
        Insert: Omit<Item, "id" | "status" | "created_at" | "updated_at"> &
          Partial<Pick<Item, "id" | "status">>;
        Update: Partial<Omit<Item, "id" | "owner_id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      claims: {
        Row: Claim;
        Insert: Omit<Claim, "id" | "status" | "created_at"> &
          Partial<Pick<Claim, "id" | "status">>;
        Update: Partial<Pick<Claim, "status">>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      received_claims: {
        Args: { p_item_id?: string | null };
        Returns: ReceivedClaim[];
      };
      sent_claims: {
        Args: Record<string, never>;
        Returns: SentClaim[];
      };
      item_has_active_claims: {
        Args: { p_item_id: string };
        Returns: boolean;
      };
      /**
       * student1 branch'inde eklenir: supabase/student1_accept_claim.sql
       * Claim'i kabul eder, item'ı claimed yapar, diğer pending claim'leri
       * reddeder — hepsi tek transaction'da.
       */
      accept_claim: {
        Args: { p_claim_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      item_type: ItemType;
      item_status: ItemStatus;
      claim_status: ClaimStatus;
      item_category: ItemCategory;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
