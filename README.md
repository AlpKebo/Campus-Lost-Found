# Campus Lost & Found

Kampüs için ortak Lost & Found web uygulaması — Exposure AI Academy grup projesi.

İki öğrenci tek repository ve tek Supabase projesi üzerinde çalışır:

| | Rol | Branch | Kapsam |
|---|---|---|---|
| **student1** | Report & Manage | `student1` | Login, profile setup, listing oluşturma/düzenleme, My Listings, gelen claim'leri accept/reject, returned/closed |
| **student2** | Discover & Claim | `student2` | Browse, search/filter/sort, Item Detail, claim gönderme, Sent Claims |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Auth + Database + Storage)

---

## Kurulum

### 1. Bağımlılıklar

```bash
npm install
```

### 2. Supabase projesi

Bu proje için **sıfırdan yeni bir Supabase projesi** aç. Eski bir ödevden kalma
proje kullanırsan (ör. içinde zaten bir `profiles` tablosu varsa) çakışma
yaşarsın.

1. [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → `supabase/schema.sql` dosyasının tamamını yapıştır → Run
   Sonda üç satır ve `rls_enabled = t` görüyorsan kurulum tamamdır.
3. **Authentication → Sign In / Providers → Email**: “Confirm email” açık,
   şifreyle giriş kapalı olsun (Magic Link için).
4. **Authentication → URL Configuration** — aşağıdaki "Supabase Auth ayarı"
   bölümüne bak. Redirect URL'leri `/**` ile bitmeli, yoksa magic link
   yanlış adrese düşer.

`schema.sql` şunları kurar: `profiles` / `items` / `claims` tabloları, enum'lar,
index'ler, yeni kullanıcı trigger'ı, tüm RLS policy'leri, `item-images` storage
bucket'ı (public, 5 MB, JPG/PNG) ve iletişim bilgisi fonksiyonları.

### 3. Environment değişkenleri

```bash
cp .env.example .env.local
```

`.env.local` içini Supabase Dashboard → Project Settings → API sayfasındaki
değerlerle doldur. **`.env.local` GitHub'a gönderilmez.**

### 4. Çalıştır

```bash
npm run dev
```

http://localhost:3000

---

## Ortak dosyalar — dikkat

Aşağıdaki dosyalar iki branch tarafından da kullanılır. Bunlara dokunmak
merge conflict'in bir numaralı sebebidir; değiştirmen gerekirse **önce
karşı tarafa haber ver**.

| Dosya | Ne işe yarar |
|---|---|
| `supabase/schema.sql` | Ortak database şeması ve RLS |
| `src/types/database.ts` | Şemayla eşleşen TypeScript tipleri |
| `src/lib/constants.ts` | Kategoriler, statüler, upload limitleri, korumalı route'lar |
| `src/lib/supabase/*` | Browser / server client'ları, session middleware |
| `src/middleware.ts` | Session yenileme + korumalı route yönlendirmesi |
| `src/components/Navbar.tsx` | Tüm route linkleri baştan tanımlı |
| `src/components/ui/*` | Button, Badge, Field, Card, Spinner, EmptyState |
| `src/app/layout.tsx` | Root layout |
| `src/app/auth/callback/route.ts` | Magic link callback |

`src/app/page.tsx` (landing) ve `src/app/login/page.tsx` çalışır durumda
bırakıldı ama **sahibi student1**'dir; student2 bu iki dosyayı değiştirmesin.

## Route dağılımı

| Route | Sahibi | Erişim |
|---|---|---|
| `/` | student1 | public |
| `/login` | student1 | public |
| `/profile-setup` | student1 | login |
| `/report` | student1 | login |
| `/my-listings` | student1 | login |
| `/browse` | student2 | public |
| `/items/[id]` | student2 | public |
| `/sent-claims` | student2 | login |

## Database sözleşmesi

```
profiles  id · email · name · created_at
items     id · owner_id · type · title · description · category ·
          location · item_date · image_url · status · created_at · updated_at
claims    id · item_id · claimant_id · message · status · created_at
```

- item status: `open` → `claimed` → `returned`, ayrıca `closed`
- claim status: `pending` · `accepted` · `rejected`
- `claims (item_id, claimant_id)` **unique** — aynı item'a ikinci claim yok
- Storage yolu: `item-images/{user_id}/{unique_filename}`

### İletişim bilgisi kuralı

`profiles` tablosu RLS ile kilitli: kimse başkasının satırını okuyamaz.
Karşı tarafın adı/emaili yalnızca şu iki fonksiyondan gelir:

```ts
// student1 — My Listings içindeki gelen claim'ler
await supabase.rpc("received_claims", { p_item_id: itemId });
// claimant_email SADECE claim accepted ise dolu gelir

// student2 — /sent-claims
await supabase.rpc("sent_claims");
// owner_name ve owner_email SADECE claim accepted ise dolu gelir
```

### student1'in branch'inde yazacağı ek SQL

Claim accept işlemi tek transaction'da üç şey yapmalı (seçilen claim →
`accepted`, item → `claimed`, diğer pending claim'ler → `rejected`). Bunun için
`accept_claim(p_claim_id uuid)` fonksiyonunu student1 kendi branch'inde
`supabase/student1_accept_claim.sql` olarak ekler.

---

## Git akışı

Ortak setup `main`'e push edildikten sonra **merge bitene kadar `main`'e push
yok**. Herkes kendi branch'inde çalışır.

```bash
git checkout -b student1        # veya student2
git push -u origin student1

# günlük döngü
git add .
git commit -m "add report form"
git push origin student1
```

Merge zamanı geldiğinde Group Project Cheat Sheet'i takip et.
Final birleşmiş `main` Vercel'e deploy edilir.

**Durum:** PR #3 (student1) ve PR #1 (student2) çapraz review sonrası merge
edildi. `main` iki tarafın işini de içeriyor.

---

## Deploy

Canlı sürüm: **https://campus-lost-found-sand.vercel.app**

Vercel projesi `main` branch'ine bağlı. Şu an **Deployment Protection açık** —
adres yalnızca proje sahibinin Vercel hesabıyla açılıyor. Sunum/teslim için
herkese açmak gerekirse Vercel → Project Settings → Deployment Protection'dan
kapatılır.

### Vercel'de tanımlı ortam değişkenleri

| Değişken | Değer |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL'i |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public anahtar |

`NEXT_PUBLIC_SITE_URL` **bilerek tanımlı değil**. Kod bu değişken yoksa
`window.location.origin`'e düşüyor (`src/app/login/page.tsx`), böylece magic
link hangi adresten giriliyorsa oraya dönüyor — preview deploy'larda da doğru
çalışıyor.

> **Windows uyarısı:** Değişkenleri PowerShell'den `... | vercel env add` ile
> eklemeyin. PowerShell native komuta pipe ederken değerin başına görünmez bir
> UTF-8 BOM ekliyor; build sorunsuz geçiyor ama uygulama çalışırken
> `ByteString ... value of 65279` hatası veriyor. Git Bash'ten
> `printf '%s' "$DEGER" | vercel env add ...` kullanın.

### Supabase Auth ayarı — atlanmamalı

`Authentication → URL Configuration`:

```
Site URL:
  https://campus-lost-found-sand.vercel.app

Redirect URLs:
  http://localhost:3000/**
  https://campus-lost-found-sand.vercel.app/**
  https://campus-lost-found-*-alp18.vercel.app/**
```

**Sondaki `/**` zorunlu.** Uygulama callback adresine query string ekliyor
(`/auth/callback?next=%2Fbrowse`, bkz. `src/app/login/page.tsx`). Listeye
query'siz `.../auth/callback` yazılırsa Supabase eşleşmeyi bulamaz ve
**Site URL'e geri düşer**.

**Neden Site URL localhost olmamalı:** İki öğrenci aynı Supabase projesini
paylaşıyor ama Site URL tek. `http://localhost:3000` yazarsa magic link
"3000 portu" der ve linke tıklayanın kendi makinesindeki 3000'e gider — o
portta hangi proje çalışıyorsa ona. Bu bir kez gerçekten yaşandı: bir
tarafın 3000'inde başka bir uygulama çalıştığı için giriş oraya düştü.
Site URL canlı adres olduğu sürece bu olamaz.
