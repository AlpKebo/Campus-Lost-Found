import { redirect } from "next/navigation";

import { ProfileSetupForm } from "@/app/profile-setup/ProfileSetupForm";
import { Card, PageHeader } from "@/components/ui/Feedback";
import { createClient } from "@/lib/supabase/server";

/**
 * Profile Setup — brief bölüm 2.
 *
 * İlk login sonrasında profilde name yoksa auth callback kullanıcıyı buraya
 * yönlendirir. Burada YALNIZCA Ad Soyad istenir; email Supabase Auth
 * hesabından otomatik gelir.
 *
 * SAHİBİ: student1.
 */

/** Açık yönlendirme (open redirect) engeli: sadece uygulama içi yollar. */
function safeNext(value: string | string[] | undefined) {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  // Zaten bu sayfadaysak sonsuz döngü olmasın.
  if (next.startsWith("/profile-setup")) return "/";
  return next;
}

export default async function ProfileSetupPage(
  props: PageProps<"/profile-setup">,
) {
  const next = safeNext((await props.searchParams).next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy zaten korumalı route'ları kapatıyor; bu ikinci kontrol.
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/profile-setup")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, created_at")
    .eq("id", user.id)
    .maybeSingle();

  // İsim zaten kayıtlıysa bu sayfanın işi yok.
  if (profile?.name) {
    redirect(next);
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <PageHeader
        title="Profilini tamamla"
        description="Devam etmeden önce adını kaydet. İlanlarında ve gönderdiğin claim'lerde bu isim görünecek."
      />

      <Card className="p-6">
        <ProfileSetupForm
          userId={user.id}
          email={profile?.email ?? user.email ?? ""}
          next={next}
        />
      </Card>
    </div>
  );
}
