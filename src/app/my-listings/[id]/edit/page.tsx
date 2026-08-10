import { notFound, redirect } from "next/navigation";

import { ItemForm } from "@/components/ItemForm";
import { Card, PageHeader } from "@/components/ui/Feedback";
import { todayISODate } from "@/lib/dates";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";

/**
 * Edit Listing — brief bölüm 7.
 *
 * "Başka kullanıcıların listing'leri edit edilememelidir." Bu kural iki
 * katmanda: burada owner_id kontrolü (sayfa hiç açılmaz) ve RLS'teki
 * items_update_own policy'si (istek doğrudan atılsa bile yazamaz).
 *
 * Status bu formda değiştirilemez — Close ve Mark as Returned ayrı
 * aksiyonlar.
 *
 * SAHİBİ: student1.
 */
export default async function EditListingPage(
  props: PageProps<"/my-listings/[id]/edit">,
) {
  const { id } = await props.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(`/my-listings/${id}/edit`)}`);
  }

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("owner_id", profile.id)
    .maybeSingle();

  // Item yok, ya da başkasının: ikisi de 404. "Var ama senin değil"
  // demek başkasının ilanının varlığını sızdırırdı.
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl py-6">
      <PageHeader
        title="Edit Listing"
        description="Update your listing details. Status changes are made from My Listings."
      />

      <Card className="p-6">
        <ItemForm
          mode="edit"
          item={item}
          userId={profile.id}
          maxDate={todayISODate()}
        />
      </Card>
    </div>
  );
}
