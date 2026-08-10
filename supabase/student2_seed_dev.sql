-- Geliştirme için örnek ilanlar — student2 (Discover & Claim).
--
-- Browse filtrelerini, aramayı ve sıralamayı boş veritabanında test etmek
-- mümkün olmadığı için bu dosya var. SADECE geliştirme ortamında çalıştır;
-- final main'e deploy edilen veritabanında çalıştırma.
--
-- Kullanım: Supabase SQL Editor'da e-postayı kendininkiyle değiştir ve Run.
-- Tekrar çalıştırmak yeni kopyalar oluşturur; temizlemek için en alttaki
-- delete satırını kullan.

insert into public.items
  (owner_id, type, title, description, category, location, item_date, image_url, status)
select
  p.id,
  v.type::public.item_type,
  v.title,
  v.description,
  v.category::public.item_category,
  v.location,
  v.item_date::date,
  '',
  v.status::public.item_status
from public.profiles p
cross join (values
  ('lost',  'Siyah deri cüzdan',      'İçinde öğrenci kartım ve bir miktar nakit vardı. Kartın arkasında adım yazıyor.', 'wallet_money', 'Mühendislik Fakültesi kantini', '2026-08-08', 'open'),
  ('found', 'Mavi kapaklı termos',    'Kütüphane 2. kat okuma salonunda masada unutulmuş halde buldum. Üzerinde çıkartma var.', 'other',        'Merkez Kütüphane 2. kat',      '2026-08-09', 'open'),
  ('lost',  'AirPods Pro kutusu',     'Beyaz şarj kutusu, sağ kulaklık içinde yok. Spor salonundan çıkarken düşürmüş olabilirim.', 'electronics',  'Spor Salonu soyunma odası',    '2026-08-05', 'open'),
  ('found', 'Anahtarlık — üç anahtar','Kırmızı ip anahtarlıkta üç anahtar. Yurt girişindeki bankta duruyordu.', 'keys',         'A Blok Yurt girişi',           '2026-08-07', 'claimed'),
  ('lost',  'Gri sırt çantası',       'İçinde iki defter, kalemlik ve şarj kablosu var. Otobüs durağında bırakmış olabilirim.', 'bag',          'Kampüs otobüs durağı',         '2026-08-02', 'open'),
  ('found', 'Öğrenci kimlik kartı',   'Yemekhane çıkışında yerde buldum. Fotoğraftaki kişiye ulaşmaya çalışıyorum.', 'id_cards',     'Merkez Yemekhane',             '2026-08-10', 'open'),
  ('lost',  'Reçeteli gözlük',        'Şeffaf çerçeveli, siyah kılıfıyla birlikte kayboldu. Derse girerken yanımdaydı.', 'accessories',  'Fen Edebiyat B-204',           '2026-07-28', 'open'),
  ('found', 'Kalkülüs ders kitabı',   'Thomas Calculus, ilk sayfada bir isim yazılı ama okunmuyor. Amfide kalmıştı.', 'books',        'Mühendislik Amfi 1',           '2026-08-06', 'open')
) as v(type, title, description, category, location, item_date, status)
where p.email = 'BURAYA_KENDI_EPOSTAN@ornek.com';

-- Kaç satır eklendi, kontrol:
select count(*) as toplam_ilan from public.items;

-- Temizlemek istersen:
-- delete from public.items where owner_id = (select id from public.profiles where email = 'BURAYA_KENDI_EPOSTAN@ornek.com');
