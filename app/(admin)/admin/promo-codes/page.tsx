import AdminShell from "@/components/admin/AdminShell";
import PromoCodesManager from "@/features/promo-codes/components/admin/PromoCodesManager";

async function PromoCodesPage() {
  return (
    <AdminShell
      heading="Promo Codes"
      description="Create and manage discount codes that customers can apply at checkout."
    >
      <PromoCodesManager />
    </AdminShell>
  );
}

export default PromoCodesPage;
