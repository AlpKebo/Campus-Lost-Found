# seed-images

`npm run seed:images` ile fal.ai'de üretilen örnek ilan görselleri buraya iner.
Dosya adları `scripts/student2-seed-image-prompts.mjs` içindeki `slug`'lardır.

Bunlar **yalnızca geliştirme/sunum için seed verisi**. Gerçek ilan görselleri
Supabase Storage'a (`item-images/{user_id}/...`) yüklenir, buraya değil.
