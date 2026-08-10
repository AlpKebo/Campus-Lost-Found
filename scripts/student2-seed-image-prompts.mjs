/**
 * Örnek ilan görselleri için prompt listesi — student2 (Discover & Claim).
 *
 * `title` alanları `supabase/student2_seed_dev.sql` içindeki başlıklarla
 * BİREBİR aynı olmalı: üretilen SQL, görseli ilana başlıktan eşleştiriyor.
 * Seed'deki bir başlığı değiştirirsen burayı da değiştir.
 *
 * `slug` hem dosya adı hem de public URL parçası: /seed-images/<slug>.jpg
 */

/** Her prompt'un sonuna eklenen ortak stil — kartlar aynı dilde görünsün diye. */
export const STYLE_SUFFIX =
  "realistic photo, single object, soft daylight, plain neutral background, " +
  "shallow depth of field, centered, no text, no watermark, no people";

export const SEED_IMAGE_PROMPTS = [
  {
    slug: "siyah-deri-cuzdan",
    title: "Siyah deri cüzdan",
    prompt: "a closed black leather bifold wallet lying on a wooden table",
  },
  {
    slug: "kahverengi-cuzdan",
    title: "Kahverengi cüzdan",
    prompt: "a worn brown leather wallet on a park bench slat",
  },
  {
    slug: "airpods-pro-kutusu",
    title: "AirPods Pro kutusu",
    prompt: "a small white wireless earbud charging case, lid closed, on a gym locker room bench",
  },
  {
    slug: "beyaz-kablosuz-kulaklik",
    title: "Beyaz kablosuz kulaklık",
    prompt: "a single white wireless earbud on grey rubber gym flooring",
  },
  {
    slug: "anahtarlik-uc-anahtar",
    title: "Anahtarlık — üç anahtar",
    prompt: "three metal keys on a red fabric keychain loop, resting on a wooden bench",
  },
  {
    slug: "yurt-odasi-anahtari",
    title: "Yurt odası anahtarı",
    prompt: "a single silver door key with a blank blue plastic tag, on concrete pavement",
  },
  {
    slug: "kalkulus-ders-kitabi",
    title: "Kalkülüs ders kitabı",
    prompt: "a thick hardcover mathematics textbook with a blank cover, left on a lecture hall desk",
  },
  {
    slug: "lineer-cebir-kitabim",
    title: "Lineer Cebir kitabım",
    prompt: "a worn paperback textbook with a blank cover, slightly open, yellow highlighter marks visible on the page edges",
  },
  {
    slug: "gri-sirt-cantasi",
    title: "Gri sırt çantası",
    prompt: "a grey canvas backpack standing upright at a bus stop",
  },
  {
    slug: "siyah-spor-cantasi",
    title: "Siyah spor çantası",
    prompt: "a black gym duffel bag on the ground next to a bus stop pole",
  },
  {
    slug: "receteli-gozluk",
    title: "Reçeteli gözlük",
    prompt: "a pair of clear-framed prescription eyeglasses folded on a classroom desk",
  },
  {
    slug: "siyah-gozluk-kilifi",
    title: "Siyah gözlük kılıfı",
    prompt: "an empty open black hardshell eyeglasses case on a classroom floor under a desk",
  },
  {
    slug: "ogrenci-kimlik-karti",
    title: "Öğrenci kimlik kartı",
    prompt: "a blank plastic id card, face down, no printing or photo visible, on a cafeteria floor tile",
  },
  {
    slug: "kutuphane-giris-karti",
    title: "Kütüphane giriş kartım",
    prompt: "a blank white access card with a lanyard clip, no printing, on paving stones",
  },
  {
    slug: "mavi-kapakli-termos",
    title: "Mavi kapaklı termos",
    prompt: "a stainless steel thermos bottle with a blue lid and a small sticker, on a library reading table",
  },
];
