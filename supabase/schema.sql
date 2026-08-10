-- =====================================================================
-- Campus Lost & Found — ORTAK DATABASE ŞEMASI
-- =====================================================================
-- Bu dosya student1 ve student2 tarafından ORTAK kullanılır.
-- Branch'lere ayrılmadan ÖNCE, Supabase Dashboard > SQL Editor içinde
-- bir kez baştan sona çalıştırılır.
--
-- ÖNERİ: Bu proje için SIFIRDAN yeni bir Supabase projesi aç.
-- Başka bir projeyle aynı database'i paylaşırsan (ör. eski bir ödevden
-- kalma "profiles" tablosu) çakışma yaşarsın. Script bu duruma karşı
-- korumalı yazıldı, ama temiz proje her zaman daha güvenli.
--
-- Script idempotent'tir: tekrar tekrar çalıştırılabilir, veri silmez.
-- Supabase Advisor (Security + Performance) uyarısı vermeyecek şekilde
-- yazılmıştır:
--   * public şemadaki tüm tablolarda RLS açık
--   * her fonksiyonda search_path sabitlenmiş
--   * auth.uid() çağrıları (select auth.uid()) ile sarılmış (initplan)
--   * aynı tablo+komut için tek permissive policy
--   * uzantılar public şemaya kurulmuyor
--
-- İçerik:
--   1. Uzantılar
--   2. Enum tipleri
--   3. profiles / items / claims tabloları
--   4. Index'ler
--   5. Trigger'lar
--   6. RLS policy'leri
--   7. Storage bucket (item-images) ve policy'leri
--   8. İletişim bilgisi fonksiyonları (SECURITY DEFINER)
--   9. Kurulum doğrulama
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Çıktıyı sessizleştir
-- ---------------------------------------------------------------------
-- "drop ... if exists" ve "add column if not exists" ifadeleri her
-- çalıştırmada onlarca NOTICE üretir. Bunlar hata değil, gürültü.
-- Sadece gerçek uyarılar ve hatalar gösterilsin:
set client_min_messages = warning;


-- ---------------------------------------------------------------------
-- 1. Uzantılar
-- ---------------------------------------------------------------------
-- pg_trgm, student2'nin title/description/location üzerinde yaptığı
-- ILIKE aramasını hızlandırır.
-- Advisor "Extension in Public" uyarısı vermesin diye public şemaya
-- KURULMAZ; Supabase'in extensions şemasına kurulur.
create schema if not exists extensions;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
    execute 'create extension pg_trgm with schema extensions';
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. Enum tipleri
-- ---------------------------------------------------------------------
do $$ begin
  create type public.item_type as enum ('lost', 'found');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.item_status as enum ('open', 'claimed', 'returned', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.claim_status as enum ('pending', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

-- Brief'teki kategori listesi birebir.
do $$ begin
  create type public.item_category as enum (
    'electronics',
    'wallet_money',
    'keys',
    'bag',
    'clothing',
    'books',
    'id_cards',
    'accessories',
    'other'
  );
exception when duplicate_object then null; end $$;


-- ---------------------------------------------------------------------
-- 3. Tablolar
-- ---------------------------------------------------------------------

-- 3a. profiles — auth.users'ın public taraftaki karşılığı.
-- name ilk girişte NULL'dır; kullanıcı /profile-setup sayfasında doldurur.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text,
  created_at timestamptz not null default now()
);

-- Tablo başka bir projeden kalmış olabilir; eksik kolonları tamamla.
-- (Bu guard olmadan "column p.name does not exist" hatası alınır.)
alter table public.profiles add column if not exists email      text;
alter table public.profiles add column if not exists name       text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- 3b. items
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  type        public.item_type not null,
  title       text not null check (length(trim(title)) between 3 and 120),
  description text not null check (length(trim(description)) between 10 and 2000),
  category    public.item_category not null,
  location    text not null check (length(trim(location)) between 2 and 120),
  item_date   date not null,
  image_url   text not null,
  status      public.item_status not null default 'open',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3c. claims
create table if not exists public.claims (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.items (id) on delete cascade,
  claimant_id uuid not null references public.profiles (id) on delete cascade,
  message     text not null check (length(trim(message)) between 10 and 1000),
  status      public.claim_status not null default 'pending',
  created_at  timestamptz not null default now()
);

-- Aynı kullanıcı aynı item'a ikinci kez claim gönderemez.
-- Reddedilmiş claim'den sonra da gönderemez (satır silinmediği için).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'claims_item_claimant_unique'
  ) then
    alter table public.claims
      add constraint claims_item_claimant_unique unique (item_id, claimant_id);
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 4. Index'ler
-- ---------------------------------------------------------------------
create index if not exists items_status_idx     on public.items (status);
create index if not exists items_type_idx       on public.items (type);
create index if not exists items_category_idx   on public.items (category);
create index if not exists items_owner_idx      on public.items (owner_id);
create index if not exists items_created_at_idx on public.items (created_at desc);

create index if not exists claims_item_idx     on public.claims (item_id);
create index if not exists claims_claimant_idx on public.claims (claimant_id);

-- Trigram index'leri: opclass'ın hangi şemada olduğunu bulup öyle kur.
do $$
declare
  trgm_schema text;
begin
  select n.nspname into trgm_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if trgm_schema is null then
    return;
  end if;

  execute format(
    'create index if not exists items_title_trgm_idx on public.items using gin (title %I.gin_trgm_ops)',
    trgm_schema);
  execute format(
    'create index if not exists items_description_trgm_idx on public.items using gin (description %I.gin_trgm_ops)',
    trgm_schema);
  execute format(
    'create index if not exists items_location_trgm_idx on public.items using gin (location %I.gin_trgm_ops)',
    trgm_schema);
end $$;


-- ---------------------------------------------------------------------
-- 5. Trigger'lar
-- ---------------------------------------------------------------------

-- 5a. Yeni auth kullanıcısı oluşunca otomatik profil satırı aç.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5b. items.updated_at otomatik güncellensin.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 6. RLS
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.items    enable row level security;
alter table public.claims   enable row level security;

-- --- profiles ---------------------------------------------------------
-- Kullanıcı sadece kendi profilini okur/günceller. Karşı tarafın adı ve
-- emaili buradan DEĞİL, 8. bölümdeki kontrollü fonksiyonlardan gelir.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- --- items policy'leri için yardımcı fonksiyon -----------------------
-- Bir item'ın aktif (pending/accepted) claim'i var mı?
--
-- NEDEN FONKSİYON: items delete policy'si doğrudan public.claims'i
-- sorgulasaydı, claims'in select policy'si de public.items'i sorguladığı
-- için PostgreSQL "infinite recursion detected in policy" hatası verirdi.
-- SECURITY DEFINER fonksiyon RLS'i atladığı için döngü kırılır.
create or replace function public.item_has_active_claims(p_item_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.claims c
    join public.items i on i.id = c.item_id
    where c.item_id = p_item_id
      and i.owner_id = (select auth.uid())   -- sadece kendi item'ın için bilgi verir
      and c.status in ('pending', 'accepted')
  );
$$;

revoke all on function public.item_has_active_claims(uuid) from public, anon;
grant execute on function public.item_has_active_claims(uuid) to authenticated;

-- --- items ------------------------------------------------------------
-- Browse public: login olmadan open ve claimed item'lar görünür.
-- returned ve closed görünmez. Owner kendi item'larını her statüde görür.
drop policy if exists items_select_public on public.items;
create policy items_select_public on public.items
  for select to anon, authenticated
  using (
    status in ('open', 'claimed')
    or owner_id = (select auth.uid())
  );

drop policy if exists items_insert_own on public.items;
create policy items_insert_own on public.items
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

-- Sadece owner kendi listing'ini edit / close / returned yapabilir.
drop policy if exists items_update_own on public.items;
create policy items_update_own on public.items
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Delete yalnızca claim'i olmayan listing'ler için. Pending veya accepted
-- claim varsa silme database seviyesinde engellenir; owner Close kullanır.
drop policy if exists items_delete_own on public.items;
create policy items_delete_own on public.items
  for delete to authenticated
  using (
    owner_id = (select auth.uid())
    and not public.item_has_active_claims(items.id)
  );

-- --- claims -----------------------------------------------------------
-- Tek SELECT policy: claimant kendi claim'lerini, item owner da kendi
-- item'ına gelen claim'leri görür. (İki ayrı permissive policy yerine
-- tek policy — Advisor "Multiple Permissive Policies" uyarısı vermez.)
drop policy if exists claims_select_own            on public.claims;
drop policy if exists claims_select_item_owner     on public.claims;
drop policy if exists claims_select_own_or_owner   on public.claims;
create policy claims_select_own_or_owner on public.claims
  for select to authenticated
  using (
    claimant_id = (select auth.uid())
    or exists (
      select 1 from public.items i
      where i.id = claims.item_id
        and i.owner_id = (select auth.uid())
    )
  );

-- Claim gönderme kuralları database seviyesinde:
--   * sadece kendi adına
--   * sadece type = 'found' ve status = 'open' item'lara
--   * kendi listing'ine claim gönderilemez
-- (Aynı item'a ikinci claim'i UNIQUE constraint engelliyor.)
drop policy if exists claims_insert_own on public.claims;
create policy claims_insert_own on public.claims
  for insert to authenticated
  with check (
    claimant_id = (select auth.uid())
    and exists (
      select 1 from public.items i
      where i.id = claims.item_id
        and i.type = 'found'
        and i.status = 'open'
        and i.owner_id <> (select auth.uid())
    )
  );

-- Claim status'unu yalnızca item owner değiştirebilir (accept / reject).
-- Claimant kendi claim'ini accepted yapamaz.
drop policy if exists claims_update_item_owner on public.claims;
create policy claims_update_item_owner on public.claims
  for update to authenticated
  using (
    exists (
      select 1 from public.items i
      where i.id = claims.item_id
        and i.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = claims.item_id
        and i.owner_id = (select auth.uid())
    )
  );

-- --- yabancı policy temizliği ----------------------------------------
-- RLS'te policy'ler OR ile birleşir: tek bir gevşek policy bütün
-- güvenliği deler. Bu yüzden bu üç tablodaki policy setinin sahibi
-- yalnızca bu dosyadır — burada tanımlı OLMAYAN her policy silinir.
--
-- Etkisi: temiz bir Supabase projesinde hiçbir şey yapmaz. Tablolar
-- başka bir projeden kalmışsa (ör. "profiles herkes tarafından
-- okunabilir" gibi eski bir policy) onları temizler.
do $$
declare
  pol record;
  expected constant text[] := array[
    'profiles:profiles_select_own',
    'profiles:profiles_insert_own',
    'profiles:profiles_update_own',
    'items:items_select_public',
    'items:items_insert_own',
    'items:items_update_own',
    'items:items_delete_own',
    'claims:claims_select_own_or_owner',
    'claims:claims_insert_own',
    'claims:claims_update_item_owner'
  ];
begin
  for pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'items', 'claims')
      and (tablename || ':' || policyname) <> all (expected)
  loop
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
    -- warning seviyesi, çünkü NOTICE'lar bilerek susturuldu ve bunun
    -- görülmesi gerekiyor: başka bir projeden kalma bir policy silindi.
    raise warning 'Yabancı policy silindi: %.%', pol.tablename, pol.policyname;
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 7. Storage — item-images bucket
-- ---------------------------------------------------------------------
-- Public bucket, max 5 MB, sadece JPG / JPEG / PNG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Görseller herkese açık okunur (Browse login gerektirmiyor).
drop policy if exists item_images_public_read on storage.objects;
create policy item_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'item-images');

-- Kullanıcı yalnızca kendi klasörüne yazabilir:
--   item-images/{user_id}/{unique_filename}
drop policy if exists item_images_insert_own_folder on storage.objects;
create policy item_images_insert_own_folder on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists item_images_update_own_folder on storage.objects;
create policy item_images_update_own_folder on storage.objects
  for update to authenticated
  using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists item_images_delete_own_folder on storage.objects;
create policy item_images_delete_own_folder on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'item-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );


-- ---------------------------------------------------------------------
-- 8. İletişim bilgisi fonksiyonları
-- ---------------------------------------------------------------------
-- profiles tablosu kilitli olduğu için karşı tarafın adı/emaili normal
-- query ile okunamaz. Bu iki fonksiyon brief'lerdeki kuralı database
-- seviyesinde uygular:
--
--   * Owner, pending claim'de claimant'in SADECE adını görür.
--     Email ancak claim accepted olduğunda döner.
--   * Claimant, owner'ın adını ve emailini SADECE claim accepted ise görür.
--
-- SECURITY DEFINER: profiles RLS'ini aşarlar, ama içerideki WHERE
-- koşulları çağıranı auth.uid() ile sınırlar. search_path sabitlendiği
-- için search_path hijacking mümkün değil.

-- 8a. student1 — My Listings içinde gösterilecek gelen claim'ler.
drop function if exists public.received_claims(uuid);
create function public.received_claims(p_item_id uuid default null)
returns table (
  claim_id       uuid,
  item_id        uuid,
  claimant_name  text,
  claimant_email text,
  message        text,
  status         public.claim_status,
  created_at     timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.id                                                    as claim_id,
    c.item_id                                               as item_id,
    prof.name                                               as claimant_name,
    case when c.status = 'accepted' then prof.email end     as claimant_email,
    c.message                                               as message,
    c.status                                                as status,
    c.created_at                                            as created_at
  from public.claims c
  join public.items i      on i.id = c.item_id
  join public.profiles prof on prof.id = c.claimant_id
  where i.owner_id = (select auth.uid())
    and (p_item_id is null or c.item_id = p_item_id)
  order by c.created_at desc;
$$;

-- 8b. student2 — /sent-claims sayfası.
drop function if exists public.sent_claims();
create function public.sent_claims()
returns table (
  claim_id       uuid,
  item_id        uuid,
  item_title     text,
  item_image_url text,
  item_location  text,
  item_type      public.item_type,
  message        text,
  status         public.claim_status,
  created_at     timestamptz,
  owner_name     text,
  owner_email    text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    c.id                                                    as claim_id,
    i.id                                                    as item_id,
    i.title                                                 as item_title,
    i.image_url                                             as item_image_url,
    i.location                                              as item_location,
    i.type                                                  as item_type,
    c.message                                               as message,
    c.status                                                as status,
    c.created_at                                            as created_at,
    case when c.status = 'accepted' then prof.name  end     as owner_name,
    case when c.status = 'accepted' then prof.email end     as owner_email
  from public.claims c
  join public.items i       on i.id = c.item_id
  join public.profiles prof on prof.id = i.owner_id
  where c.claimant_id = (select auth.uid())
  order by c.created_at desc;
$$;

-- Bu fonksiyonlar login gerektirir; anon rolüne kapalı.
revoke all on function public.received_claims(uuid) from public, anon;
revoke all on function public.sent_claims()         from public, anon;
grant execute on function public.received_claims(uuid) to authenticated;
grant execute on function public.sent_claims()         to authenticated;


-- ---------------------------------------------------------------------
-- 9. Kurulum doğrulama
-- ---------------------------------------------------------------------
-- Script sonunda bu sorgu çalışır.
-- Üç satırın da "sonuc" kolonunda OK yazıyorsa kurulum tamamdır.
with beklenen(table_name, policy_count) as (
  values ('profiles', 3), ('items', 4), ('claims', 3)
)
select
  b.table_name,
  c.relrowsecurity                          as rls_enabled,
  b.policy_count                            as beklenen_policy,
  count(p.polname)                          as mevcut_policy,
  case
    when c.oid is null                      then 'HATA: tablo yok'
    when not c.relrowsecurity               then 'HATA: RLS kapalı'
    when count(p.polname) <> b.policy_count then 'HATA: policy sayısı tutmuyor'
    else 'OK'
  end                                       as sonuc
from beklenen b
left join pg_class c
  on c.relname = b.table_name
 and c.relnamespace = 'public'::regnamespace
left join pg_policy p on p.polrelid = c.oid
group by b.table_name, b.policy_count, c.oid, c.relrowsecurity
order by b.table_name;
