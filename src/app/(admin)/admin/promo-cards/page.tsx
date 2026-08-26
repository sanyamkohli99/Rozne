import AdminShell from "@/components/admin/AdminShell";
import { getPromoCards } from "@/_actions/promo-cards";
import PromoCardsForm from "@/features/promo-cards/components/admin/PromoCardsForm";

async function PromoCardsPage() {
  const cards = await getPromoCards();

  return (
    <AdminShell
      heading="Promo Cards"
      description="Manage the 4 homepage promo cards, including images, titles, descriptions, and catchphrases."
    >
      <PromoCardsForm cards={cards} />
    </AdminShell>
  );
}

export default PromoCardsPage;
