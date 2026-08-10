-- OTOMATİK ÜRETİLDİ — elle düzenleme, `npm run seed:images` yeniden yazar.
--
-- student2_seed_dev.sql ile eklenen örnek ilanlara fal.ai görsellerini bağlar.
-- Önce seed ilanları ekle, sonra bunu Supabase SQL Editor'da çalıştır.
-- Görseller repoda public/seed-images/ altında durur, Storage kullanılmaz.

update public.items as i
set image_url = v.image_url,
    updated_at = now()
from (values
  ('Siyah deri cüzdan', '/seed-images/siyah-deri-cuzdan.jpg'),
  ('Kahverengi cüzdan', '/seed-images/kahverengi-cuzdan.jpg'),
  ('AirPods Pro kutusu', '/seed-images/airpods-pro-kutusu.jpg'),
  ('Beyaz kablosuz kulaklık', '/seed-images/beyaz-kablosuz-kulaklik.jpg'),
  ('Anahtarlık — üç anahtar', '/seed-images/anahtarlik-uc-anahtar.jpg'),
  ('Yurt odası anahtarı', '/seed-images/yurt-odasi-anahtari.jpg'),
  ('Kalkülüs ders kitabı', '/seed-images/kalkulus-ders-kitabi.jpg'),
  ('Lineer Cebir kitabım', '/seed-images/lineer-cebir-kitabim.jpg'),
  ('Gri sırt çantası', '/seed-images/gri-sirt-cantasi.jpg'),
  ('Siyah spor çantası', '/seed-images/siyah-spor-cantasi.jpg'),
  ('Reçeteli gözlük', '/seed-images/receteli-gozluk.jpg'),
  ('Siyah gözlük kılıfı', '/seed-images/siyah-gozluk-kilifi.jpg'),
  ('Öğrenci kimlik kartı', '/seed-images/ogrenci-kimlik-karti.jpg'),
  ('Kütüphane giriş kartım', '/seed-images/kutuphane-giris-karti.jpg'),
  ('Mavi kapaklı termos', '/seed-images/mavi-kapakli-termos.jpg')
) as v(title, image_url)
where i.title = v.title
  and i.image_url is distinct from v.image_url;

-- Kontrol:
select title, image_url from public.items order by created_at desc;

-- Geri almak istersen:
-- update public.items set image_url = '' where image_url like '/seed-images/%';
