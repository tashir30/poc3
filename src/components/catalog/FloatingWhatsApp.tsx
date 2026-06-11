import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { buildCatalogEnquiryMessage, buildWhatsAppUrl } from "@/lib/validation";

interface FloatingWhatsAppProps {
  whatsappNumber: string;
  businessName: string;
}

export function FloatingWhatsApp({
  whatsappNumber,
  businessName,
}: FloatingWhatsAppProps) {
  const url = buildWhatsAppUrl(
    whatsappNumber,
    buildCatalogEnquiryMessage(businessName),
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Enquire on WhatsApp"
      className="fixed bottom-6 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--catalog-wa)] text-white shadow-lg shadow-emerald-900/20 transition hover:scale-105 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--catalog-wa)] md:hidden sm:bottom-8 sm:right-8"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  );
}
