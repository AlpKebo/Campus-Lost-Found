/**
 * Landing'deki klasörden saçılan ürün görselleri — student1 (bölüm 1).
 *
 * student2'nin seed görsellerinden AYRI tutuluyor: onlar ilan kartlarına
 * bağlanan örnek veri, bunlar landing'in dekoratif animasyonu. Farklı
 * klasör (public/landing-items) ve farklı script, böylece iki taraf
 * birbirinin dosyasını ezmiyor.
 *
 * `slug` hem dosya adı hem public URL parçası: /landing-items/<slug>.jpg
 */

/**
 * Ortak stil eki.
 *
 * Koyu zeminli ürün fotoğrafı istiyoruz: landing'in arka planı koyu bir
 * gradyan, beyaz fonlu görseller orada yama gibi duruyor. "seamless dark
 * charcoal background" + rim light ile kartlar zemine oturuyor.
 *
 * Negatif ifadeler (no text/logo/people) marka ve yüz üretimini bastırmak
 * için: ilan görseli gibi görünmeli, reklam gibi değil.
 */
export const STYLE_SUFFIX =
  "professional product photograph, single object, centered composition, " +
  "seamless dark charcoal background, soft key light with subtle cool rim light, " +
  "gentle reflection beneath the object, shallow depth of field, sharp focus, " +
  "high detail, photorealistic, 50mm lens, " +
  "no text, no logo, no branding, no watermark, no people, no hands";

export const LANDING_ITEM_PROMPTS = [
  { slug: "black-wallet", title: "Black wallet", prompt: "a closed black leather bifold wallet, slightly worn corners" },
  { slug: "earbuds-case", title: "Earbuds case", prompt: "a small white wireless earbud charging case, lid closed, glossy plastic" },
  { slug: "key-ring", title: "Keys", prompt: "a ring of three metal keys with a small red fabric fob" },
  { slug: "grey-backpack", title: "Grey backpack", prompt: "a grey canvas backpack standing upright, padded straps visible" },
  { slug: "water-bottle", title: "Water bottle", prompt: "a brushed stainless steel insulated water bottle with a blue lid" },
  { slug: "eyeglasses", title: "Eyeglasses", prompt: "a pair of clear acetate framed eyeglasses, folded, thin metal hinges" },
  { slug: "student-card", title: "Student card", prompt: "a blank white plastic access card with a lanyard clip, no printing" },
  { slug: "umbrella", title: "Umbrella", prompt: "a compact folded navy blue umbrella with a wrist strap" },
  { slug: "laptop-charger", title: "Laptop charger", prompt: "a white laptop power adapter with the cable coiled neatly" },
  { slug: "notebook", title: "Notebook", prompt: "a closed hardcover notebook with an elastic band, plain cover" },
  { slug: "headphones", title: "Headphones", prompt: "a pair of over-ear headphones with a padded headband, matte black" },
  { slug: "calculator", title: "Calculator", prompt: "a scientific calculator with a grey plastic body and dark buttons" },
  { slug: "wool-scarf", title: "Wool scarf", prompt: "a folded chunky knit wool scarf in muted burgundy" },
  { slug: "phone", title: "Phone", prompt: "a modern smartphone lying face down, dark matte back, no logo" },
];
