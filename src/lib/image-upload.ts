import {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_TYPES,
  ITEM_IMAGES_BUCKET,
  MAX_IMAGE_BYTES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

/**
 * Item görseli yükleme yardımcıları — brief bölüm 4.
 *
 * SAHİBİ: student1. Hem Report formu hem de Edit Listing kullanır.
 * Storage yolu: item-images/{user_id}/{unique_filename}
 */

/** Dosyayı yüklemeden önce tarayıcıda doğrular. Sorun yoksa null döner. */
export function validateImageFile(file: File | null): string | null {
  if (!file) return "Görsel zorunludur.";

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Sadece ${ALLOWED_IMAGE_EXTENSIONS.join(", ")} dosyaları yüklenebilir.`;
  }

  if (file.size > MAX_IMAGE_BYTES) {
    const limitMb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));
    return `Görsel en fazla ${limitMb} MB olabilir.`;
  }

  return null;
}

/** "photo.JPG" -> "jpg". Uzantı yoksa MIME tipinden türetir. */
function extensionOf(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_IMAGE_EXTENSIONS.includes(`.${fromName}`)) {
    return fromName;
  }
  return file.type === "image/png" ? "png" : "jpg";
}

export type UploadedImage = {
  /** Bucket içindeki yol — silmek için gerekir. */
  path: string;
  /** items.image_url içine yazılan public URL. */
  publicUrl: string;
};

/**
 * Görseli kullanıcının kendi klasörüne yükler.
 * Storage RLS policy'si başka bir klasöre yazmayı zaten engelliyor.
 */
export async function uploadItemImage(
  file: File,
  userId: string,
): Promise<UploadedImage> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}.${extensionOf(file)}`;

  const { error } = await supabase.storage
    .from(ITEM_IMAGES_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(ITEM_IMAGES_BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

/**
 * Yüklenmiş görseli siler.
 *
 * Kullanımı: insert/update başarısız olursa yüklenen dosya bucket'ta öksüz
 * kalmasın diye geri alma adımı. Silme başarısız olursa sessiz geçilir —
 * kullanıcıya gösterilecek asıl hata zaten insert hatasıdır.
 */
export async function removeItemImage(path: string) {
  const supabase = createClient();
  await supabase.storage.from(ITEM_IMAGES_BUCKET).remove([path]);
}

/**
 * items.image_url içindeki public URL'den bucket yolunu çıkarır.
 *
 * URL biçimi: <proje>/storage/v1/object/public/item-images/<user_id>/<dosya>
 * Edit sırasında eski görseli silmek için gerekir. Beklenen biçimde
 * olmayan URL'lerde null döner — o zaman eski dosya silinmez, bırakılır.
 */
export function storagePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${ITEM_IMAGES_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;

  const path = publicUrl.slice(index + marker.length);
  return path.length > 0 ? decodeURIComponent(path) : null;
}
