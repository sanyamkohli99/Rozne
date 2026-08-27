import AdminShell from "@/components/admin/AdminShell";
import PaymentSettingsForm from "@/features/carts/components/admin/PaymentSettingsForm";
import { getEnabledGateways } from "@/_actions/settings";
import { getCredentials } from "@/_actions/credentials";

export const dynamic = "force-dynamic";

async function PaymentSettingsPage() {
  const [gateways, razorpayCreds, stripeCreds] = await Promise.all([
    getEnabledGateways(),
    getCredentials("razorpay"),
    getCredentials("stripe"),
  ]);

  return (
    <AdminShell
      heading="Payment Settings"
      description="Manage payment methods and API keys. All changes require your admin password."
    >
      <PaymentSettingsForm
        initialGateways={gateways}
        initialRazorpayKeyId={razorpayCreds?.keyId ?? ""}
        hasRazorpaySecret={!!razorpayCreds?.keySecret}
        initialStripeKeyId={stripeCreds?.keyId ?? ""}
        hasStripeSecret={!!stripeCreds?.keySecret}
      />
    </AdminShell>
  );
}

export default PaymentSettingsPage;
