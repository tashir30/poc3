"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { buildCatalogEnquiryMessage, buildWhatsAppUrl } from "@/lib/validation";

interface ShareCatalogProps {
  catalogUrl: string;
  businessName: string;
  whatsappNumber: string;
}

export function ShareCatalog({
  catalogUrl,
  businessName,
  whatsappNumber,
}: ShareCatalogProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(catalogUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const whatsappShareUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Check out our catalog: ${catalogUrl}`,
  );

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(catalogUrl)}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <WhatsAppButton
        href={whatsappShareUrl}
        label="Share on WhatsApp"
        className="w-full sm:w-auto"
      />
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-slate-300 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 sm:w-auto"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={() => window.open(facebookUrl, "_blank", "noopener,noreferrer")}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border-2 border-slate-300 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 sm:w-auto"
      >
        Facebook
      </button>
    </div>
  );
}

export function WhatsAppEnquireButton({
  whatsappNumber,
  productName,
  businessName,
  className = "",
}: {
  whatsappNumber: string;
  productName?: string;
  businessName: string;
  className?: string;
}) {
  const message = productName
    ? `Hello, I am interested in ${productName} from your catalog.`
    : buildCatalogEnquiryMessage(businessName);

  const url = buildWhatsAppUrl(whatsappNumber, message);

  return (
    <WhatsAppButton href={url} label="Enquire on WhatsApp" className={className} />
  );
}
