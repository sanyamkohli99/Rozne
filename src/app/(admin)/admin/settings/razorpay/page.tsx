import AdminShell from "@/components/admin/AdminShell";
import RazorpayCredentialsForm from "@/features/carts/components/admin/RazorpayCredentialsForm";
import { getCredentials } from "@/_actions/credentials";

export const dynamic = "force-dynamic";

async function RazorpaySettingsPage() {
  const creds = await getCredentials("razorpay");

  return (
    <AdminShell
      heading="Razorpay API Keys"
      description="Enter your Razorpay test or live keys. All values are encrypted before storage. Changes require your admin password."
    >
      <RazorpayCredentialsForm
        initialKeyId={creds?.keyId ?? ""}
        hasSecret={!!creds?.keySecret}
        hasWebhook={!!creds?.webhookSecret}
      />
    </AdminShell>
  );
}

export default RazorpaySettingsPage;
