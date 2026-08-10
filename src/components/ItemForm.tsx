"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Feedback";
import {
  FieldError,
  FormError,
  FormSuccess,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/Field";
import { CATEGORIES, ITEM_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";
import {
  removeItemImage,
  storagePathFromPublicUrl,
  uploadItemImage,
  validateImageFile,
} from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/client";
import type { Item, ItemCategory, ItemType } from "@/types/database";

/**
 * Item formu — Report (brief bölüm 3-5) ve Edit Listing (bölüm 7) aynı
 * alanları paylaşır, o yüzden tek bileşen iki modda çalışır.
 *
 * SAHİBİ: student1. student2 bu dosyayı kullanmıyor.
 *
 * DİKKAT: status bu formda YOK. Brief bölüm 7: "Status normal edit
 * formunun içinden değiştirilmemelidir." Close ve Mark as Returned
 * My Listings üzerindeki ayrı aksiyonlardır.
 */

/** Alan sınırları schema.sql'deki CHECK constraint'leriyle aynı. */
const LIMITS = {
  title: { min: 3, max: 120 },
  description: { min: 10, max: 2000 },
  location: { min: 2, max: 120 },
};

type Fields = {
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory | "";
  item_date: string;
  location: string;
};

type FieldErrors = Partial<Record<keyof Fields | "image", string>>;

const EMPTY_FIELDS: Fields = {
  type: "lost",
  title: "",
  description: "",
  category: "",
  item_date: "",
  location: "",
};

function fieldsOf(item: Item): Fields {
  return {
    type: item.type,
    title: item.title,
    description: item.description,
    category: item.category,
    item_date: item.item_date,
    location: item.location,
  };
}

/** imageRequired: create modunda görsel zorunlu, edit modunda opsiyonel. */
function validate(
  fields: Fields,
  image: File | null,
  imageRequired: boolean,
): FieldErrors {
  const errors: FieldErrors = {};

  const title = fields.title.trim();
  if (title.length < LIMITS.title.min) {
    errors.title = `Başlık en az ${LIMITS.title.min} karakter olmalı.`;
  } else if (title.length > LIMITS.title.max) {
    errors.title = `Başlık en fazla ${LIMITS.title.max} karakter olabilir.`;
  }

  const description = fields.description.trim();
  if (description.length < LIMITS.description.min) {
    errors.description = `Açıklama en az ${LIMITS.description.min} karakter olmalı.`;
  } else if (description.length > LIMITS.description.max) {
    errors.description = `Açıklama en fazla ${LIMITS.description.max} karakter olabilir.`;
  }

  if (!fields.category) {
    errors.category = "Kategori seç.";
  }

  if (!fields.item_date) {
    errors.item_date = "Tarih seç.";
  }

  const location = fields.location.trim();
  if (location.length < LIMITS.location.min) {
    errors.location = `Konum en az ${LIMITS.location.min} karakter olmalı.`;
  } else if (location.length > LIMITS.location.max) {
    errors.location = `Konum en fazla ${LIMITS.location.max} karakter olabilir.`;
  }

  if (image || imageRequired) {
    const imageError = validateImageFile(image);
    if (imageError) errors.image = imageError;
  }

  return errors;
}

type ItemFormProps = {
  userId: string;
  /** Bugün — gelecekte bir tarih seçilemesin diye. */
  maxDate: string;
} & (
  | { mode: "create"; item?: undefined }
  | { mode: "edit"; item: Item }
);

export function ItemForm({ userId, maxDate, mode, item }: ItemFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [fields, setFields] = useState<Fields>(
    item ? fieldsOf(item) : EMPTY_FIELDS,
  );
  const [image, setImage] = useState<File | null>(null);
  /** Dosya input'unu resetlemek için: key değişince input boşalır. */
  const [fileInputKey, setFileInputKey] = useState(0);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
    // Kullanıcı düzeltmeye başlayınca o alanın hatasını kaldır.
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function clearImage() {
    setImage(null);
    setFileInputKey((key) => key + 1);
  }

  function resetForm() {
    setFields(EMPTY_FIELDS);
    clearImage();
    setErrors({});
    setFormError(null);
    setCreated(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validationErrors = validate(fields, image, !isEdit);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    let uploadedPath: string | null = null;

    try {
      // Edit modunda yeni dosya seçilmediyse mevcut görsel korunur.
      const uploaded = image ? await uploadItemImage(image, userId) : null;
      uploadedPath = uploaded?.path ?? null;

      const values = {
        type: fields.type,
        title: fields.title.trim(),
        description: fields.description.trim(),
        category: fields.category as ItemCategory,
        location: fields.location.trim(),
        item_date: fields.item_date,
      };

      const supabase = createClient();

      if (isEdit) {
        const { error } = await supabase
          .from("items")
          .update(
            uploaded ? { ...values, image_url: uploaded.publicUrl } : values,
          )
          .eq("id", item.id)
          // owner_id şartı RLS'te de var; burada ikinci bir emniyet.
          .eq("owner_id", userId);

        if (error) throw error;

        // Görsel değiştiyse eskisi bucket'ta yer kaplamasın.
        if (uploaded) {
          const oldPath = storagePathFromPublicUrl(item.image_url);
          if (oldPath) await removeItemImage(oldPath);
        }

        router.push("/my-listings");
        router.refresh();
        return;
      }

      const { error } = await supabase.from("items").insert({
        ...values,
        owner_id: userId,
        image_url: uploaded!.publicUrl,
      });

      if (error) throw error;

      setCreated(true);
      setFields(EMPTY_FIELDS);
      clearImage();
    } catch (error) {
      // Satır yazılamadıysa yeni yüklenen görsel öksüz kalmasın.
      if (uploadedPath) await removeItemImage(uploadedPath);
      setFormError(
        error instanceof Error
          ? error.message
          : "İşlem tamamlanamadı, tekrar dene.",
      );
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="space-y-4">
        <FormSuccess>İlanın yayınlandı.</FormSuccess>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/my-listings">My Listings&apos;e git</ButtonLink>
          <Button type="button" variant="secondary" onClick={resetForm}>
            Yeni ilan oluştur
          </Button>
        </div>
      </div>
    );
  }

  const maxImageMb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && <FormError>{formError}</FormError>}

      <fieldset disabled={loading} className="space-y-5">
        <div>
          <Label>Ne bildiriyorsun?</Label>
          <div className="flex gap-2">
            {ITEM_TYPES.map((option) => (
              <label
                key={option.value}
                className={`flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-center text-sm font-medium ${
                  fields.type === option.value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={fields.type === option.value}
                  onChange={() => update("type", option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {fields.type === "lost"
              ? "Kaybettiğin bir eşyayı arıyorsun."
              : "Bulduğun bir eşyanın sahibini arıyorsun."}
          </p>
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={fields.title}
            onChange={(event) => update("title", event.target.value)}
            maxLength={LIMITS.title.max}
            placeholder="Siyah deri cüzdan"
            aria-invalid={errors.title ? true : undefined}
          />
          <FieldError>{errors.title}</FieldError>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={fields.description}
            onChange={(event) => update("description", event.target.value)}
            maxLength={LIMITS.description.max}
            placeholder="Eşyayı tanımlayan detaylar: renk, marka, üzerindeki ayırt edici işaretler…"
            aria-invalid={errors.description ? true : undefined}
          />
          <FieldError>{errors.description}</FieldError>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              value={fields.category}
              onChange={(event) =>
                update("category", event.target.value as ItemCategory)
              }
              aria-invalid={errors.category ? true : undefined}
            >
              <option value="">Seç…</option>
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
            <FieldError>{errors.category}</FieldError>
          </div>

          <div>
            <Label htmlFor="item_date">Date</Label>
            <Input
              id="item_date"
              type="date"
              max={maxDate}
              value={fields.item_date}
              onChange={(event) => update("item_date", event.target.value)}
              aria-invalid={errors.item_date ? true : undefined}
            />
            <FieldError>{errors.item_date}</FieldError>
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={fields.location}
            onChange={(event) => update("location", event.target.value)}
            maxLength={LIMITS.location.max}
            placeholder="Library 2nd Floor"
            aria-invalid={errors.location ? true : undefined}
          />
          <FieldError>{errors.location}</FieldError>
        </div>

        <div>
          <Label htmlFor="image">Image</Label>

          {isEdit && (
            <div className="mb-3 flex items-center gap-3">
              <Image
                src={item.image_url}
                alt={item.title}
                width={72}
                height={72}
                className="size-18 rounded-lg object-cover"
              />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Mevcut görsel. Değiştirmek istemiyorsan dosya seçme.
              </p>
            </div>
          )}

          <Input
            key={fileInputKey}
            id="image"
            type="file"
            accept="image/jpeg,image/png"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setImage(file);
              setErrors((current) => ({
                ...current,
                image: file ? (validateImageFile(file) ?? undefined) : undefined,
              }));
            }}
            className="file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:file:bg-neutral-800 dark:file:text-neutral-100"
            aria-invalid={errors.image ? true : undefined}
          />
          <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            JPG, JPEG veya PNG · en fazla {maxImageMb} MB
            {image && ` · seçilen: ${image.name}`}
          </p>
          <FieldError>{errors.image}</FieldError>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" className="sm:flex-1" disabled={loading}>
          {loading && <Spinner />}
          {isEdit
            ? loading
              ? "Kaydediliyor…"
              : "Değişiklikleri kaydet"
            : loading
              ? "Yayınlanıyor…"
              : "Listing'i yayınla"}
        </Button>

        {isEdit && (
          <ButtonLink
            href="/my-listings"
            variant="secondary"
            className="sm:flex-1"
          >
            Vazgeç
          </ButtonLink>
        )}
      </div>
    </form>
  );
}
