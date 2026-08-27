import AdminShell from "@/components/admin/AdminShell";
import PaymentSettingsForm from "@/features/carts/components/admin/PaymentSettingsForm";
import { getEnabledGateways } from "@/_actions/settings";

export const dynamic = "force-dynamic";

type Props = {};

async function PaymentSettingsPage({}: Props) {
  const gateways = await getEnabledGateways();

  return (
    <AdminShell
      heading="Payment Settings"
      description="Choose which payment methods customers see at checkout. Changes are protected — you must confirm with your admin password."
    >
      <PaymentSettingsForm initial={gateways} />
    </AdminShell>
  );
}

export default PaymentSettingsPage;
