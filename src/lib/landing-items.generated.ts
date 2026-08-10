// OTOMATİK ÜRETİLDİ — elle düzenleme, `npm run landing:images` yeniden yazar.
//
// Landing'de klasörden saçılan ürün görselleri. Kaynak prompt listesi:
// scripts/student1-landing-item-prompts.mjs

export type LandingItem = {
  slug: string;
  title: string;
  src: string;
};

export const LANDING_ITEMS: LandingItem[] = [
  { slug: "black-wallet", title: "Black wallet", src: "/landing-items/black-wallet.jpg" },
  { slug: "earbuds-case", title: "Earbuds case", src: "/landing-items/earbuds-case.jpg" },
  { slug: "key-ring", title: "Keys", src: "/landing-items/key-ring.jpg" },
  { slug: "grey-backpack", title: "Grey backpack", src: "/landing-items/grey-backpack.jpg" },
  { slug: "water-bottle", title: "Water bottle", src: "/landing-items/water-bottle.jpg" },
  { slug: "eyeglasses", title: "Eyeglasses", src: "/landing-items/eyeglasses.jpg" },
  { slug: "student-card", title: "Student card", src: "/landing-items/student-card.jpg" },
  { slug: "umbrella", title: "Umbrella", src: "/landing-items/umbrella.jpg" },
  { slug: "laptop-charger", title: "Laptop charger", src: "/landing-items/laptop-charger.jpg" },
  { slug: "notebook", title: "Notebook", src: "/landing-items/notebook.jpg" },
  { slug: "headphones", title: "Headphones", src: "/landing-items/headphones.jpg" },
  { slug: "calculator", title: "Calculator", src: "/landing-items/calculator.jpg" },
  { slug: "wool-scarf", title: "Wool scarf", src: "/landing-items/wool-scarf.jpg" },
  { slug: "phone", title: "Phone", src: "/landing-items/phone.jpg" },
];
