import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";

/**
 * page.tsx notFound() çağırdığında görünen 404.
 *
 * SAHİBİ: student2 (Discover & Claim).
 *
 * İki durumda buraya düşülür: id geçerli bir UUID değil, ya da o id'de bir
 * ilan yok (silinmiş olabilir). Kullanıcı açısından ikisi de aynı, bu yüzden
 * tek bir mesaj yeterli — önemli olan onu boş bir 404'te bırakmamak.
 */
export default function ItemNotFound() {
  return (
    <div className="py-16">
      <EmptyState
        title="İlan bulunamadı"
        description="Bu ilan silinmiş ya da adres yanlış olabilir. Listeden aramayı deneyebilirsin."
        action={<ButtonLink href="/browse">Browse&apos;a dön</ButtonLink>}
      />
    </div>
  );
}
