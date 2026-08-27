import AdminShell from "@/components/admin/AdminShell";
import HeroSettingsForm from "@/features/hero/components/admin/HeroSettingsForm";
import { getHeroImage } from "@/_actions/settings";

export const dynamic = "force-dynamic";

async function HeroSettingsPage() {
  const heroImage = await getHeroImage();

  return (
    <AdminShell
      heading="Hero Image"
      description="Change the main hero banner image on the homepage. Changes require your admin password."
    >
      <HeroSettingsForm initialImageUrl={heroImage} />
    </AdminShell>
  );
}

export default HeroSettingsPage;
