-- Geliştirme için örnek ilanlar — student2 (Discover & Claim).
--
-- Browse filtrelerini, aramayı, sıralamayı ve "benzer ilanlar" bölümünü boş
-- veritabanında test etmek mümkün olmadığı için bu dosya var. SADECE
-- geliştirme ortamında çalıştır; final main'e deploy edilen veritabanında
-- çalıştırma.
--
-- Kullanım: Supabase SQL Editor'da e-postayı kendininkiyle değiştir ve Run.
-- Dosya tekrar çalıştırılabilir: aynı başlıktan ikinci kopya eklenmez, yalnızca
-- eksik olanlar girer. Temizlemek için en alttaki delete satırını kullan.
--
-- KATEGORİ EŞLEŞMELERİ ÖNEMLİ: /items/[id] sayfasındaki "benzer ilanlar"
-- bölümü aynı kategorideki KARŞIT TÜR ilanları gösterir. Aşağıdaki liste
-- bilerek çapraz eşleşecek şekilde kuruldu — her kategoride hem lost hem
-- found ilan var, yoksa o bölüm hiç görünmez ve test edilemez.

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
  -- wallet_money çifti
  ('lost',  'Siyah deri cüzdan',       'İçinde öğrenci kartım ve bir miktar nakit vardı. Kartın arkasında adım yazıyor.', 'wallet_money', 'Mühendislik Fakültesi kantini', '2026-08-08', 'open'),
  ('found', 'Kahverengi cüzdan',       'Kantin önündeki bankta buldum. İçinde kart var ama nakit yok, sahibine ulaşmak istiyorum.', 'wallet_money', 'Mühendislik Fakültesi bahçesi', '2026-08-09', 'open'),

  -- electronics çifti
  ('lost',  'AirPods Pro kutusu',      'Beyaz şarj kutusu, sağ kulaklık içinde yok. Spor salonundan çıkarken düşürmüş olabilirim.', 'electronics',  'Spor Salonu soyunma odası',    '2026-08-05', 'open'),
  ('found', 'Beyaz kablosuz kulaklık', 'Koşu bandının yanında duruyordu. Kutusu yok, tek kulaklık. Sahibi çıkmazsa güvenliğe bırakacağım.', 'electronics',  'Spor Salonu kardiyo alanı',    '2026-08-06', 'open'),

  -- keys çifti
  ('found', 'Anahtarlık — üç anahtar', 'Kırmızı ip anahtarlıkta üç anahtar. Yurt girişindeki bankta duruyordu.', 'keys',         'A Blok Yurt girişi',           '2026-08-07', 'claimed'),
  ('lost',  'Yurt odası anahtarı',     'Tek anahtar, üzerinde mavi bir etiket vardı. Yurttan çıkarken kaybettim.', 'keys',         'A Blok Yurt çevresi',          '2026-08-06', 'open'),

  -- books çifti
  ('found', 'Kalkülüs ders kitabı',    'Thomas Calculus, ilk sayfada bir isim yazılı ama okunmuyor. Amfide kalmıştı.', 'books',        'Mühendislik Amfi 1',           '2026-08-06', 'open'),
  ('lost',  'Lineer Cebir kitabım',    'Kapağı yıpranmış, içinde sarı fosforlu çizgiler var. Amfide unuttum sanırım.', 'books',        'Mühendislik Amfi 1',           '2026-08-04', 'open'),

  -- bag çifti
  ('lost',  'Gri sırt çantası',        'İçinde iki defter, kalemlik ve şarj kablosu var. Otobüs durağında bırakmış olabilirim.', 'bag',          'Kampüs otobüs durağı',         '2026-08-02', 'open'),
  ('found', 'Siyah spor çantası',      'Durakta sahipsiz duruyordu. İçinde spor kıyafeti ve havlu var.', 'bag',          'Kampüs otobüs durağı',         '2026-08-03', 'open'),

  -- accessories çifti
  ('lost',  'Reçeteli gözlük',         'Şeffaf çerçeveli, siyah kılıfıyla birlikte kayboldu. Derse girerken yanımdaydı.', 'accessories',  'Fen Edebiyat B-204',           '2026-07-28', 'open'),
  ('found', 'Siyah gözlük kılıfı',     'Sınıfta sıranın altında buldum, içi boş. Gözlüğünü arayan biri olabilir.', 'accessories',  'Fen Edebiyat B-206',           '2026-07-29', 'open'),

  -- id_cards çifti
  ('found', 'Öğrenci kimlik kartı',    'Yemekhane çıkışında yerde buldum. Fotoğraftaki kişiye ulaşmaya çalışıyorum.', 'id_cards',     'Merkez Yemekhane',             '2026-08-10', 'open'),
  ('lost',  'Kütüphane giriş kartım',  'Yemekhane ile kütüphane arasında bir yerde düşürdüm. Üzerinde numaram yazıyor.', 'id_cards',     'Merkez Yemekhane çevresi',     '2026-08-09', 'open'),

  -- other — eşi bilerek yok, "benzer ilan çıkmayan" durumu da test edilebilsin
  ('found', 'Mavi kapaklı termos',     'Kütüphane 2. kat okuma salonunda masada unutulmuş halde buldum. Üzerinde çıkartma var.', 'other',        'Merkez Kütüphane 2. kat',      '2026-08-09', 'open')
) as v(type, title, description, category, location, item_date, status)
where p.email = 'BURAYA_KENDI_EPOSTAN@ornek.com'
  -- Tekrar çalıştırıldığında aynı ilanı ikinci kez eklemesin.
  and not exists (
    select 1 from public.items i
    where i.owner_id = p.id and i.title = v.title
  );

-- Kaç satır var, kontrol:
select type, count(*) as adet from public.items group by type order by type;

-- Temizlemek istersen:
-- delete from public.items where owner_id = (select id from public.profiles where email = 'BURAYA_KENDI_EPOSTAN@ornek.com');
