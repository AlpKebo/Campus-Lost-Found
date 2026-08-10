/**
 * Örnek ilanlar için fal.ai ile görsel üretir — student2 (Discover & Claim).
 *
 * Kullanım:
 *   npm run seed:images              # eksik görselleri üretir
 *   npm run seed:images -- --force   # var olanları da yeniden üretir
 *   npm run seed:images -- --only=gri-sirt-cantasi,receteli-gozluk
 *
 * Ne yapar:
 *   1. .env.local içindeki FAL_KEY ile fal.ai'ye istek atar
 *   2. Görselleri public/seed-images/<slug>.jpg olarak indirir
 *   3. supabase/student2_seed_images.sql dosyasını üretir — bunu Supabase
 *      SQL Editor'da çalıştırınca ilanların image_url'i dolar
 *
 * NEDEN STORAGE'A YÜKLEMİYOR: item-images bucket'ının insert policy'si
 * `{user_id}/...` klasörüne kilitli (bkz. supabase/schema.sql). Script'ten
 * yüklemek service-role anahtarı gerektirirdi; onu repoya sokmamak için
 * görseller public/ altından servis ediliyor. Bu yalnızca seed verisi içindir,
 * gerçek ilan yükleme akışı değişmiyor.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SEED_IMAGE_PROMPTS, STYLE_SUFFIX } from "./student2-seed-image-prompts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "seed-images");
const SQL_OUT = path.join(ROOT, "supabase", "student2_seed_images.sql");
const PUBLIC_PREFIX = "/seed-images";
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

function parseArgs(argv) {
  const force = argv.includes("--force");
  const onlyArg = argv.find((a) => a.startsWith("--only="));
  const only = onlyArg
    ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  return { force, only };
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
      image_size: "landscape_4_3", // kartlar aspect-4/3
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

/** Üretilen görselleri ilanlara bağlayan SQL. Başlıktan eşleşir. */
function buildSql(entries) {
  const rows = entries
    .map(
      ({ title, slug }) =>
        `  (${sqlString(title)}, ${sqlString(`${PUBLIC_PREFIX}/${slug}.jpg`)})`,
    )
    .join(",\n");

  return `-- OTOMATİK ÜRETİLDİ — elle düzenleme, \`npm run seed:images\` yeniden yazar.
--
-- student2_seed_dev.sql ile eklenen örnek ilanlara fal.ai görsellerini bağlar.
-- Önce seed ilanları ekle, sonra bunu Supabase SQL Editor'da çalıştır.
-- Görseller repoda public/seed-images/ altında durur, Storage kullanılmaz.

update public.items as i
set image_url = v.image_url,
    updated_at = now()
from (values
${rows}
) as v(title, image_url)
where i.title = v.title
  and i.image_url is distinct from v.image_url;

-- Kontrol:
select title, image_url from public.items order by created_at desc;

-- Geri almak istersen:
-- update public.items set image_url = '' where image_url like '${PUBLIC_PREFIX}/%';
`;
}

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  await loadEnvFile();

  if (!process.env.FAL_KEY) {
    console.error(
      "FAL_KEY yok. .env.local içine anahtarını yaz:\n" +
        "  FAL_KEY=...   (https://fal.ai/dashboard/keys)",
    );
    process.exit(1);
  }

  const { force, only } = parseArgs(process.argv.slice(2));
  const model = process.env.FAL_MODEL || DEFAULT_MODEL;

  const targets = only
    ? SEED_IMAGE_PROMPTS.filter((item) => only.includes(item.slug))
    : SEED_IMAGE_PROMPTS;

  if (targets.length === 0) {
    console.error(`--only ile eşleşen slug yok: ${only?.join(", ")}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log(`Model: ${model} — ${targets.length} görsel\n`);

  const failed = [];

  for (const [index, item] of targets.entries()) {
    const destination = path.join(OUT_DIR, `${item.slug}.jpg`);
    const label = `[${index + 1}/${targets.length}] ${item.title}`;

    if (!force && existsSync(destination)) {
      console.log(`${label} — atlandı (dosya var, --force ile yenile)`);
      continue;
    }

    try {
      const url = await generateImageUrl(model, item.prompt);
      await download(url, destination);
      console.log(`${label} — ${path.relative(ROOT, destination)}`);
    } catch (error) {
      failed.push(item.slug);
      console.error(`${label} — HATA: ${error.message}`);
    }
  }

  // SQL yalnızca gerçekten dosyası olan ilanları içerir.
  const ready = SEED_IMAGE_PROMPTS.filter((item) =>
    existsSync(path.join(OUT_DIR, `${item.slug}.jpg`)),
  );

  if (ready.length > 0) {
    await writeFile(SQL_OUT, buildSql(ready), "utf8");
    console.log(
      `\n${ready.length} görsel hazır. Şimdi ${path.relative(ROOT, SQL_OUT)} ` +
        "dosyasını Supabase SQL Editor'da çalıştır.",
    );
  }

  if (failed.length > 0) {
    console.error(`\nÜretilemeyenler: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
