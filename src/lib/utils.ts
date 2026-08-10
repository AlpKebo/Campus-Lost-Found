/**
 * Koşullu className birleştirici.
 *
 * shadcn'in `cn`'i clsx + tailwind-merge kullanır. Bu proje shadcn değil ve
 * çakışan Tailwind sınıflarını son-yazan-kazanır mantığıyla eritmeye
 * ihtiyacımız yok — bileşenler className'i her zaman kendi sınıflarının
 * SONUNA ekliyor, CSS sırası zaten çağıranı kazandırıyor. O yüzden iki
 * bağımlılık eklemek yerine bu üç satır yeterli.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
