-- =====================================================================
-- accept_claim — student1 (brief bölüm 10)
-- =====================================================================
-- Supabase Dashboard > SQL Editor içinde BİR KEZ çalıştırılır.
-- schema.sql'den ayrı tutuldu: ortak şema main'de, bu fonksiyon
-- student1 branch'inin işi.
--
-- NEDEN AYRI BİR FONKSİYON:
-- Brief bölüm 10 accept işleminin TEK İŞLEMDE üç şey yapmasını istiyor:
--   1. seçilen claim  -> accepted
--   2. item           -> claimed
--   3. diğer pending claim'ler -> rejected
--
-- Bunu client'tan üç ayrı update ile yapsaydık ikincisi hata verdiğinde
-- veri tutarsız kalırdı (claim accepted ama item hâlâ open gibi).
-- Fonksiyon içindeki üç update tek transaction'dadır: hepsi olur ya da
-- hiçbiri olmaz.
--
-- Script idempotent'tir: tekrar çalıştırılabilir.
-- =====================================================================

set client_min_messages = warning;

-- SECURITY DEFINER: claims ve items üzerinde RLS'i aşar. Yetki kontrolü
-- fonksiyonun içinde açıkça yapılıyor — çağıran, item'ın owner'ı değilse
-- hiçbir satır güncellenmez. search_path sabit, yani hijack edilemez.
create or replace function public.accept_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_id uuid;
begin
  -- Claim gerçekten çağıranın item'ına mı ait, item hâlâ open mı?
  -- item 'claimed' ise zaten kabul edilmiş bir claim var; 'returned' veya
  -- 'closed' ise iş bitmiş demektir.
  select c.item_id
    into v_item_id
  from public.claims c
  join public.items i on i.id = c.item_id
  where c.id = p_claim_id
    and c.status = 'pending'
    and i.owner_id = (select auth.uid())
    and i.status = 'open';

  if v_item_id is null then
    raise exception
      'Claim kabul edilemedi: claim bulunamadı, zaten işlenmiş ya da bu item senin değil.'
      using errcode = 'check_violation';
  end if;

  -- Item satırını kilitle. Owner butona iki kez basarsa ya da iki sekmeden
  -- iki farklı claim aynı anda kabul edilirse, ikinci istek burada bekler
  -- ve aşağıdaki tekrar kontrolüne takılır.
  perform 1 from public.items where id = v_item_id for update;

  if not exists (
    select 1 from public.claims where id = p_claim_id and status = 'pending'
  ) then
    raise exception 'Bu claim bu sırada başka bir işlemle güncellendi.'
      using errcode = 'check_violation';
  end if;

  -- 1. Seçilen claim kabul edilir.
  update public.claims
     set status = 'accepted'
   where id = p_claim_id;

  -- 2. Aynı item'daki diğer bekleyen claim'ler reddedilir.
  --    (Zaten rejected olanlara dokunulmaz.)
  update public.claims
     set status = 'rejected'
   where item_id = v_item_id
     and id <> p_claim_id
     and status = 'pending';

  -- 3. Item claimed olur.
  update public.items
     set status = 'claimed'
   where id = v_item_id;
end;
$$;

-- Login gerektirir; anon rolüne kapalı.
revoke all on function public.accept_claim(uuid) from public, anon;
grant execute on function public.accept_claim(uuid) to authenticated;


-- ---------------------------------------------------------------------
-- Kurulum doğrulama
-- ---------------------------------------------------------------------
-- Tek satır ve sonuc = OK görüyorsan fonksiyon hazır.
select
  p.proname                                   as fonksiyon,
  p.prosecdef                                 as security_definer,
  case
    when not p.prosecdef then 'HATA: SECURITY DEFINER değil'
    when not has_function_privilege(
      'authenticated', p.oid, 'execute'
    )                   then 'HATA: authenticated execute yetkisi yok'
    else 'OK'
  end                                         as sonuc
from pg_proc p
where p.pronamespace = 'public'::regnamespace
  and p.proname = 'accept_claim';
