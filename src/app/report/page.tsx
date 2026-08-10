import { redirect } from "next/navigation";

import { ItemForm } from "@/components/ItemForm";
import { Card, PageHeader } from "@/components/ui/Feedback";
import { todayISODate } from "@/lib/dates";
import { getCurrentProfile } from "@/lib/supabase/server";

/**
 * Report Item — brief bölüm 3, 4, 5.
 *
 * Sadece login olmuş kullanıcılar erişebilir (proxy + buradaki kontrol).
 * Profilinde adı yoksa önce /profile-setup tamamlanır: ilanın üstünde
 * gösterilecek isim orada kaydediliyor.
 *
 * SAHİBİ: student1.
 */
export default async function ReportPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent("/report")}`);
  }

  if (!profile.name) {
    redirect(`/profile-setup?next=${encodeURIComponent("/report")}`);
  }

  return (
    <div className="mx-auto max-w-2xl py-6">
      <PageHeader
        title="Report Item"
        description="Post something you lost or found. Once it's live you can manage it from My Listings."
      />

      <Card className="p-6">
        <ItemForm mode="create" userId={profile.id} maxDate={todayISODate()} />
      </Card>
    </div>
  );
}
