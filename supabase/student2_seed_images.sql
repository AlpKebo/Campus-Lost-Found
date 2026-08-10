-- OTOMATİK ÜRETİLDİ — elle düzenleme, `npm run seed:images` yeniden yazar.
--
-- student2_seed_dev.sql ile eklenen örnek ilanlara fal.ai görsellerini bağlar.
-- Önce seed ilanları ekle, sonra bunu Supabase SQL Editor'da çalıştır.
-- Görseller repoda public/seed-images/ altında durur, Storage kullanılmaz.

update public.items as i
set image_url = v.image_url,
    updated_at = now()
from (values
  ('Gri sırt çantası', '/seed-images/gri-sirt-cantasi.jpg')
) as v(title, image_url)
where i.title = v.title
  and i.image_url is distinct from v.image_url;

-- Kontrol:
select title, image_url from public.items order by created_at desc;

-- Geri almak istersen:
-- update public.items set image_url = '' where image_url like '/seed-images/%';
