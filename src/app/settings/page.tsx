import { redirect } from "next/navigation";
import { BusinessSettingsForm } from "@/components/settings/BusinessSettingsForm";
import { requireBusinessContext } from "@/lib/session";

export default async function SettingsPage() {
  const { business, profile } = await requireBusinessContext();

  if (profile.role !== "admin") {
    redirect("/inventory");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const catalogUrl = `${appUrl}/${business.slug}`;

  return (
    <BusinessSettingsForm
      businessName={business.name}
      slug={business.slug}
      catalogUrl={catalogUrl}
      whatsappNumber={business.whatsapp_number}
      description={business.description}
      instagramUrl={business.instagram_url}
    />
  );
}
