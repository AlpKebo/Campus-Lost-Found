/**
 * Landing'de klasörden saçılan ürün görsellerini fal.ai ile üretir.
 *
 * Kullanım:
 *   npm run landing:images              # eksik olanları üretir
 *   npm run landing:images -- --force   # hepsini yeniden üretir
 *
 * Ne yapar:
 *   1. .env.local içindeki FAL_KEY ile fal.ai'ye istek atar
 *   2. public/landing-items/<slug>.jpg olarak indirir
 *   3. src/lib/landing-items.generated.ts dosyasını yazar
 *
 * NEDEN ÜRETİLEN BİR TS DOSYASI: liste iki yerde (script + uygulama)
 * tutulursa kaçınılmaz olarak birbirinden ayrışır. Tek kaynak burada,
 * uygulama üretilen dosyayı import ediyor.
 *
 * FAL_KEY .env.local'den okunur ve hiçbir yere yazılmaz; .gitignore
 * `.env*` girdisiyle bu dosyayı zaten commit dışında tutuyor.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LANDING_ITEM_PROMPTS,
  STYLE_SUFFIX,
} from "./student1-landing-item-prompts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "landing-items");
const TS_OUT = path.join(ROOT, "src", "lib", "landing-items.generated.ts");
const PUBLIC_PREFIX = "/landing-items";
const DEFAULT_MODEL = "fal-ai/flux/schnell";

/** .env.local (yoksa .env) içinden KEY=VALUE satırlarını okur. */
async function loadEnvFile() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(ROOT, name);
    if (!existsSync(file)) continue;

    const text = await readFile(file, "utf8");
    for (const line of text.split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue; // gerçek ortam değişkeni önceliklidir
      process.env[key] = rawValue.replace(/^["']|["']$/g, "").trim();
    }
  }
}

/**
 * fal.ai senkron endpoint'i: POST https://fal.run/<model>
 * Yanıt: { images: [{ url, ... }] }
 */
async function generateImageUrl(model, prompt) {
  const response = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: `${prompt}, ${STYLE_SUFFIX}`,
      // Saçılan kartlar dikey (portre) — kare yerine 3:4 istiyoruz.
      image_size: "portrait_4_3",
      num_images: 1,
      output_format: "jpeg",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`fal.ai ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const url = data?.images?.[0]?.url;
  if (!url) {
    throw new Error(`Beklenmeyen yanıt: ${JSON.stringify(data).slice(0, 300)}`);
  }
  return url;
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Görsel indirilemedi (${response.status}): ${url}`);
  }
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

function buildTs(entries) {
  const rows = entries
    .map(
      ({ slug, title }) =>
        `  { slug: ${JSON.stringify(slug)}, title: ${JSON.stringify(title)}, src: ${JSON.stringify(
          `${PUBLIC_PREFIX}/${slug}.jpg`,
        )} },`,
    )
    .join("\n");

  return `// OTOMATİK ÜRETİLDİ — elle düzenleme, \`npm run landing:images\` yeniden yazar.
//
// Landing'de klasörden saçılan ürün görselleri. Kaynak prompt listesi:
// scripts/student1-landing-item-prompts.mjs

export type LandingItem = {
  slug: string;
  title: string;
  src: string;
};

export const LANDING_ITEMS: LandingItem[] = [
${rows}
];
`;
}

async function main() {
  await loadEnvFile();

  if (!process.env.FAL_KEY) {
    console.error(
      "FAL_KEY bulunamadı. .env.local içine FAL_KEY=... satırını ekle.",
    );
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const model = process.env.FAL_MODEL || DEFAULT_MODEL;

  await mkdir(OUT_DIR, { recursive: true });

  const done = [];
  for (const entry of LANDING_ITEM_PROMPTS) {
    const destination = path.join(OUT_DIR, `${entry.slug}.jpg`);

    if (!force && existsSync(destination)) {
      console.log(`atlandı (zaten var): ${entry.slug}`);
      done.push(entry);
      continue;
    }

    try {
      process.stdout.write(`üretiliyor: ${entry.slug} … `);
      const url = await generateImageUrl(model, entry.prompt);
      await download(url, destination);
      console.log("bitti");
      done.push(entry);
    } catch (error) {
      // Tek bir görsel patlarsa diğerleri üretilmeye devam etsin.
      console.log(`HATA — ${error.message}`);
    }
  }

  if (done.length === 0) {
    console.error("Hiç görsel üretilemedi.");
    process.exit(1);
  }

  await writeFile(TS_OUT, buildTs(done));
  console.log(`\n${done.length} görsel hazır → public/landing-items/`);
  console.log(`Liste yazıldı → src/lib/landing-items.generated.ts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
