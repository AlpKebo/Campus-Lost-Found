-- =====================================================================
-- Community Shelf — 30 gün claim'lenmeyen "found" ilanlar başkasının
-- başvurusuna açılır.
-- =====================================================================
-- Supabase Dashboard > SQL Editor içinde supabase/schema.sql'den SONRA,
-- bir kez çalıştırılır. schema.sql'den ayrı tutuldu: ortak şema main'de,
-- bu özellik sonradan eklendi ve kendi tablosunu/fonksiyonlarını getiriyor.
--
-- FİKİR: bir "found" ilan SHELF_DAYS (30) gündür açıksa ve üzerinde aktif
-- (pending/accepted) bir claim yoksa, ilan sahibi olmayan biri "bu bana
-- lazım" diyerek başvurabilir. Sahibi başvurulardan birini kabul edince
-- item 'donated' olur ve Browse'dan düşer — tıpkı claim kabul edilince
-- 'claimed' olup düşmesi gibi.
--
-- claims'ten AYRI bir tablo: claims_insert_own policy'si ve
-- (item_id, claimant_id) unique constraint'i "kendi eşyanı geri istiyorsun"
-- akışına kilitli. Oraya "ihtiyacım var" başvurusunu karıştırmak o akışı
-- kırma riski taşırdı. donation_requests aynı deseni (status, RLS,
-- SECURITY DEFINER iletişim fonksiyonları) tekrar eder, claim_status
-- enum'ını (pending/accepted/rejected) olduğu gibi kullanır.
--
-- Script idempotent'tir: tekrar tekrar çalıştırılabilir, veri silmez.
-- =====================================================================

set client_min_messages = warning;


-- ---------------------------------------------------------------------
-- 1. items.status'a yeni değer: 'donated'
-- ---------------------------------------------------------------------
-- IF NOT EXISTS ile PG 12+ idempotent. Bu ifade kendi statement'ı olarak
-- çalışır; aynı script içindeki sonraki CREATE FUNCTION'lar 'donated'
-- değerini yalnızca metin olarak taşır (plpgsql gövdesi çalışma anına kadar
-- değerlendirilmez), o yüzden sıralamadan kaynaklı bir sorun yok.
alter type public.item_status add value if not exists 'donated';


-- ---------------------------------------------------------------------
-- 2. donation_requests tablosu
-- ---------------------------------------------------------------------
create table if not exists public.donation_requests (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.items (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  message      text not null check (length(trim(message)) between 10 and 1000),
  status       public.claim_status not null default 'pending',
  created_at   timestamptz not null default now()
);

-- Aynı kullanıcı aynı item'a ikinci kez başvuramaz.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'donation_requests_item_requester_unique'
  ) then
    alter table public.donation_requests
      add constraint donation_requests_item_requester_unique unique (item_id, requester_id);
  end if;
end $$;

create index if not exists donation_requests_item_idx
  on public.donation_requests (item_id);
create index if not exists donation_requests_requester_idx
  on public.donation_requests (requester_id);


-- ---------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------
alter table public.donation_requests enable row level security;

-- Tek SELECT policy: başvuran kendi başvurularını, item owner da kendi
-- item'ına gelen başvuruları görür (claims_select_own_or_owner ile aynı desen).
drop policy if exists donation_requests_select_own_or_owner on public.donation_requests;
create policy donation_requests_select_own_or_owner on public.donation_requests
  for select to authenticated
  using (
    requester_id = (select auth.uid())
    or exists (
      select 1 from public.items i
      where i.id = donation_requests.item_id
        and i.owner_id = (select auth.uid())
    )
  );

-- Başvuru kuralları database seviyesinde:
--   * sadece kendi adına
--   * sadece type = 'found', status = 'open'
--   * item_date en az 30 gün önce (SHELF_DAYS — src/lib/constants.ts ile
--     aynı sayı, değiştirirsen ikisini birlikte değiştir)
--   * kendi ilanına başvurulamaz
--   * üzerinde aktif (pending/accepted) bir claim varsa başvurulamaz —
--     gerçek sahibi hâlâ süreçteyse rafa düşmemeli
-- (Aynı item'a ikinci başvuruyu UNIQUE constraint engelliyor.)
drop policy if exists donation_requests_insert_own on public.donation_requests;
create policy donation_requests_insert_own on public.donation_requests
  for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and exists (
      select 1 from public.items i
      where i.id = donation_requests.item_id
        and i.type = 'found'
        and i.status = 'open'
        and i.owner_id <> (select auth.uid())
        and i.item_date <= (current_date - 30)
        and not exists (
          select 1 from public.claims c
          where c.item_id = i.id
            and c.status in ('pending', 'accepted')
        )
    )
  );

-- Başvuru durumunu yalnızca item owner değiştirebilir (accept / reject).
drop policy if exists donation_requests_update_item_owner on public.donation_requests;
create policy donation_requests_update_item_owner on public.donation_requests
  for update to authenticated
  using (
    exists (
      select 1 from public.items i
      where i.id = donation_requests.item_id
        and i.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.items i
      where i.id = donation_requests.item_id
        and i.owner_id = (select auth.uid())
    )
  );


-- ---------------------------------------------------------------------
-- 4. accept_donation_request — claim kabulündeki üç adımlı deseni tekrarlar
-- ---------------------------------------------------------------------
-- (bkz. supabase/student1_accept_claim.sql — aynı gerekçe: tek transaction'da
-- 1) seçilen başvuru -> accepted, 2) diğer bekleyen başvurular -> rejected,
-- 3) item -> donated.)
create or replace function public.accept_donation_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
begin
  select d.item_id
    into v_item_id
  from public.donation_requests d
  join public.items i on i.id = d.item_id
  where d.id = p_request_id
    and d.status = 'pending'
    and i.owner_id = (select auth.uid())
    and i.status = 'open';

  if v_item_id is null then
    raise exception
      'Request could not be accepted: not found, already resolved, or this listing is not yours.'
      using errcode = 'check_violation';
  end if;

  -- Item satırını kilitle — owner iki kez basarsa ya da iki sekmeden iki
  -- farklı başvuru aynı anda kabul edilirse ikinci istek burada bekler.
  perform 1 from public.items where id = v_item_id for update;

  if not exists (
    select 1 from public.donation_requests where id = p_request_id and status = 'pending'
  ) then
    raise exception 'This request was updated by another action in the meantime.'
      using errcode = 'check_violation';
  end if;

  update public.donation_requests
     set status = 'accepted'
   where id = p_request_id;

  update public.donation_requests
     set status = 'rejected'
   where item_id = v_item_id
     and id <> p_request_id
     and status = 'pending';

  update public.items
     set status = 'donated'
   where id = v_item_id;
end;
$$;

revoke all on function public.accept_donation_request(uuid) from public, anon;
grant execute on function public.accept_donation_request(uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 5. İletişim bilgisi fonksiyonları — received_claims/sent_claims deseni
-- ---------------------------------------------------------------------
-- profiles RLS ile kilitli olduğu için karşı tarafın adı/emaili buradan
-- değil, bu iki fonksiyondan gelir. Email yalnızca başvuru accepted ise dolar.

-- received_claims() item bilgisi taşımaz çünkü My Listings içinde zaten
-- item'ın kendi kartının altında gösterilir. received_donation_requests()
-- ise düz, kendi başına bir sayfada (/community-shelf) gösteriliyor — sent_claims()
-- gibi item_title/item_image_url/item_location'ı da taşıması gerekiyor.
drop function if exists public.received_donation_requests(uuid);
create function public.received_donation_requests(p_item_id uuid default null)
returns table (
  request_id      uuid,
  item_id         uuid,
  item_title      text,
  item_image_url  text,
  item_location   text,
  requester_name  text,
  requester_email text,
  message         text,
  status          public.claim_status,
  created_at      timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    d.id                                                    as request_id,
    d.item_id                                                as item_id,
    i.title                                                   as item_title,
    i.image_url                                                as item_image_url,
    i.location                                                 as item_location,
    prof.name                                                as requester_name,
    case when d.status = 'accepted' then prof.email end      as requester_email,
    d.message                                                as message,
    d.status                                                 as status,
    d.created_at                                             as created_at
  from public.donation_requests d
  join public.items i       on i.id = d.item_id
  join public.profiles prof on prof.id = d.requester_id
  where i.owner_id = (select auth.uid())
    and (p_item_id is null or d.item_id = p_item_id)
  order by d.created_at desc;
$$;

drop function if exists public.sent_donation_requests();
create function public.sent_donation_requests()
returns table (
  request_id     uuid,
  item_id        uuid,
  item_title     text,
  item_image_url text,
  item_location  text,
  -- Başvuru hâlâ "pending" görünse bile item başka biri (bir claim ya da
  -- başka bir başvuru) tarafından çoktan alınmış olabilir. UI bunu buradan
  -- ayırt eder: item_status 'open' değilse ve request 'pending' ise "artık
  -- uygun değil" mesajı gösterir — items tablosunu ayrıca sorgulamaya
  -- gerek yok, o zaten RLS ile kapalı olabilir (bkz. items_select_public).
  item_status    public.item_status,
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
    d.id                                                    as request_id,
    i.id                                                     as item_id,
    i.title                                                  as item_title,
    i.image_url                                               as item_image_url,
    i.location                                                as item_location,
    i.status                                                  as item_status,
    d.message                                                as message,
    d.status                                                 as status,
    d.created_at                                             as created_at,
    case when d.status = 'accepted' then prof.name  end      as owner_name,
    case when d.status = 'accepted' then prof.email end      as owner_email
  from public.donation_requests d
  join public.items i       on i.id = d.item_id
  join public.profiles prof on prof.id = i.owner_id
  where d.requester_id = (select auth.uid())
  order by d.created_at desc;
$$;

revoke all on function public.received_donation_requests(uuid) from public, anon;
revoke all on function public.sent_donation_requests()         from public, anon;
grant execute on function public.received_donation_requests(uuid) to authenticated;
grant execute on function public.sent_donation_requests()         to authenticated;


-- ---------------------------------------------------------------------
-- 6. Kurulum doğrulama
-- ---------------------------------------------------------------------
-- schema.sql'in bölüm 9'undaki desenin aynısı: tablo hiç yoksa bile bir
-- satır dönsün diye sabit bir satırdan LEFT JOIN yapıyoruz.
with beklenen(table_name, policy_count) as (
  values ('donation_requests', 3)
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
group by b.table_name, b.policy_count, c.oid, c.relrowsecurity;
