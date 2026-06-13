import type { Business } from "@/types/database";
import { resolveCatalogTheme } from "@/lib/catalog-themes";
import { CatalogFooter } from "./CatalogFooter";
import { CatalogHeader } from "./CatalogHeader";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

interface CatalogShellProps {
  business: Business;
  children: React.ReactNode;
  showFloatingWhatsApp?: boolean;
}

export function CatalogShell({
  business,
  children,
  showFloatingWhatsApp = true,
}: CatalogShellProps) {
  const theme = resolveCatalogTheme(business.catalog_theme);

  return (
    <div
      className="catalog-site flex min-h-full flex-col"
      data-catalog-theme={theme}
    >
      <CatalogHeader
        slug={business.slug}
        businessName={business.name}
        logoUrl={business.logo_url}
        whatsappNumber={business.whatsapp_number}
        instagramUrl={business.instagram_url}
        tagline={business.description}
      />
      <main className="flex-1">{children}</main>
      <CatalogFooter
        businessName={business.name}
        whatsappNumber={business.whatsapp_number}
        instagramUrl={business.instagram_url}
        slug={business.slug}
      />
      {showFloatingWhatsApp ? (
        <FloatingWhatsApp
          whatsappNumber={business.whatsapp_number}
          businessName={business.name}
        />
      ) : null}
    </div>
  );
}
