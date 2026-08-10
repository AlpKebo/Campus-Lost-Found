# student2 — çalışma notları

Bu dosya student2'nin (Discover & Claim) branch'inde biriken bağlam. Yeni bir
Claude oturumu açıldığında sıfırdan başlamasın diye tutuluyor.
Proje kurallarının tamamı için `README.md`'ye bak.

## Kim hangi işi yapıyor

- **student1** — `/`, `/login`, `/profile-setup`, `/report`, `/my-listings`
- **student2 (bu branch)** — `/browse`, `/items/[id]`, `/sent-claims`

`student2` branch'inde çalışırken student1'in route'larına ve README'deki
"Ortak dosyalar" tablosundaki dosyalara **dokunulmaz**. Merge bitene kadar
`main`'e push yok.

## student2 tarafında yazılanlar

| Dosya | İş |
|---|---|
| `src/app/browse/page.tsx` | İlan listesi, filtreleri uygulayan sorgu |
| `src/app/browse/BrowseFilters.tsx` | Arama + tür/kategori/sıralama, GET form |
| `src/app/browse/ItemCard.tsx` | Liste kartı |
| `src/app/browse/filters.ts` | Querystring okuma ve doğrulama |
| `src/app/browse/loading.tsx` | Filtre + ızgara iskeleti |
| `src/app/browse/error.tsx` | Hata sınırı |
| `src/app/items/[id]/page.tsx` | İlan detayı + claim paneli |
| `src/app/items/[id]/ClaimForm.tsx` | Claim formu (client) |
| `src/app/items/[id]/actions.ts` | Claim server action'ı |
| `src/app/items/[id]/claim-contract.ts` | Claim sabitleri ve durum tipi |
| `src/app/items/[id]/RelatedItems.tsx` | Benzer ilanlar (karşıt tür, aynı kategori) |
| `src/app/items/[id]/loading.tsx` | Detay iskeleti |
| `src/app/items/[id]/error.tsx` | Hata sınırı |
| `src/app/items/[id]/not-found.tsx` | İlan bulunamadı sayfası |
| `src/app/sent-claims/page.tsx` | Gönderilen claim'ler |
| `src/app/sent-claims/loading.tsx` | Liste iskeleti |
| `src/app/sent-claims/error.tsx` | Hata sınırı |
| `src/lib/student2-format.ts` | Tarih biçimlendirme |
| `src/components/student2-Skeleton.tsx` | İskelet parçaları |
| `src/components/student2-RouteError.tsx` | Ortak hata ekranı (client) |
| `supabase/student2_seed_dev.sql` | Geliştirme için örnek ilanlar |

Ortak `src/lib` ve `src/components` altındaki dosyalar bilerek `student2-` ile
başlıyor: aynı isimde iki dosya açılırsa merge conflict çıkar.

## Yeni dosya açarken

Yeni bir yardımcı dosya gerekirse ya kendi route klasörüne koy, ya da adını
`student2-` ile başlat. Ortak klasörlere çıplak isimle dosya ekleme.

## Tuzaklar

- **`"use server"` dosyaları yalnızca async fonksiyon export edebilir.** Sabit
  veya tip export edilirse bundler modülü "hiç export'u yok" sayar ve sayfa
  500 verir. TypeScript bunu yakalamıyor. `claim-contract.ts` bu yüzden ayrı.
- **Claim kuralları RLS'te.** `claims_insert_own`: yalnızca `type='found'` ve
  `status='open'` ilanlara, kendi ilanına değil, kişi başı tek claim
  (unique constraint). Arayüz bu kurallarla birebir aynı olmalı, yoksa
  kullanıcı formu doldurup reddediliyor.
- **`profiles` RLS ile kilitli.** Karşı tarafın adı/e-postası yalnızca
  `sent_claims()` RPC'sinden ve yalnızca claim `accepted` ise gelir. Doğrudan
  `profiles` sorgulama.
- **PostgREST `or` filtresi virgülle ayrılır.** Arama metnindeki `,` `(` `)`
  filtreyi bozar, `%` ve `_` ilike joker karakteridir. `sanitizeSearch()`
  bunları temizliyor — arama koduna dokunursan aynısını koru.
- **Tarih biçimlendirmede `Intl` kullanma.** Server ve client farklı çıktı
  verirse React hydration uyarısı basar.
- **Next 16'da `error.tsx` prop'u `reset` değil `retry`.** `retry()` segmenti
  veriyi yeniden çekerek render ediyor; `reset` yalnızca hata durumunu
  temizliyordu. İnternetteki eski örnekler `reset` yazıyor, bu sürümde yanlış.
- **`/items/[id]` klasörüne `loading.tsx` EKLEME.** `loading.tsx` sayfayı bir
  Suspense sınırına sarıyor, yanıt akmaya başlıyor, HTTP başlıkları gidiyor ve
  `notFound()` artık durum kodunu değiştiremiyor: 404 sessizce 200'e dönüyor.
  Denendi ve geri alındı. Sayfanın yavaş kısmı olan benzer ilanlar zaten kendi
  `<Suspense>` iskeletiyle akıyor. `/browse` ve `/sent-claims` `notFound()`
  çağırmadığı için oralarda `loading.tsx` sorunsuz.
- **Benzer ilanlar kategori eşleşmesine dayanıyor.** `RelatedItems` aynı
  kategorideki KARŞIT tür ilanları getiriyor. Seed verisinde bir kategoride
  yalnızca tek tür varsa bölüm hiç görünmez — özellik bozuk sanılır. Seed
  dosyası bilerek çapraz çiftler içeriyor, o yapıyı koru.
- **Windows:** PowerShell'de `&&` çalışmaz, komutları tek tek çalıştır.

## Doğrulama

Değişiklikten sonra üçü de temiz olmalı:

```
npx tsc --noEmit
npm run lint
npm run build
```

`build` ayrı bir adım olarak duruyor çünkü `tsc` ve `lint` yakalamadığı halde
derlemede patlayan hatalar var (ör. `"use server"` export kuralı).

`npm run dev` → http://localhost:3000

Veritabanı boşken filtreleri test edemezsin; `supabase/student2_seed_dev.sql`
dosyasındaki e-postayı kendininkiyle değiştirip Supabase SQL Editor'da
çalıştır. Dosya tekrar çalıştırılabilir, aynı ilanı ikinci kez eklemiyor.
Kendi ilanına claim atılamadığı için claim formunu denemek istersen ikinci bir
e-postayla giriş yapman gerekir.
