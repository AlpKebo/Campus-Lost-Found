/**
 * Örnek ilan görselleri için prompt listesi — student2 (Discover & Claim).
 *
 * `title` alanları `supabase/student2_seed_dev.sql` içindeki başlıklarla
 * BİREBİR aynı olmalı: üretilen SQL, görseli ilana başlıktan eşleştiriyor.
 * Seed'deki bir başlığı değiştirirsen burayı da değiştir.
 *
 * `slug` hem dosya adı hem de public URL parçası: /seed-images/<slug>.jpg
 */

/**
 * Her prompt'un sonuna eklenen ortak stil — kartlar aynı görsel dilde olsun diye.
 *
 * İlk sürüm ("realistic photo, soft daylight, plain neutral background") fazla
 * kısaydı: model neyi keskinleştireceğini bilemediği için kartlar bulanık ve
 * çizim gibi çıkıyordu. Burada üç şey açıkça söyleniyor —
 *   1. NE tür bir görüntü: fotoğraf, illüstrasyon/render değil (son satırdaki
 *      negatifler bunu bastırıyor)
 *   2. NASIL çekilmiş: 50mm, açık diyafram, doğal pencere ışığı
 *   3. NE kadar detay: keskin odak, malzeme dokusu, gerçek renk
 *
 * Not: prompt'ların kendisi ortamı söylüyor ("on a lecture hall desk"), o
 * yüzden landing script'indeki gibi düz koyu fon ZORLANMIYOR — bunlar bir
 * öğrencinin telefonla çektiği ilan fotoğrafı gibi durmalı.
 */
export const STYLE_SUFFIX =
  "photorealistic photograph, sharp focus on the object, fine material texture, " +
  "natural window light, soft realistic shadows, shallow depth of field with a " +
  "gently blurred background, 50mm lens, high detail, true to life colour, " +
  "no text, no logo, no branding, no watermark, no people, no hands, " +
  "not an illustration, not a 3d render, not a cartoon";

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
  // Community Shelf testi için: bkz. student2_seed_dev.sql'deki 30+ gün
  // önceki iki "found" ilan.
  {
    slug: "sahipsiz-laptop-sarj-aleti",
    title: "Sahipsiz laptop şarj aleti",
    prompt: "a white laptop power adapter with a coiled cable, sitting in a cardboard lost-and-found box",
  },
  {
    slug: "gri-yun-atki",
    title: "Gri yün atkı",
    prompt: "a folded grey wool scarf draped over the back of a lecture hall chair",
  },
];
