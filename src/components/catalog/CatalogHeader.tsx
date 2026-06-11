import Link from "next/link";
import { SearchIcon } from "@/components/shared/SearchIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import {
  buildCatalogEnquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/validation";

interface CatalogHeaderProps {
  slug: string;
  businessName: string;
  logoUrl?: string | null;
  whatsappNumber: string;
  tagline?: string | null;
}

export function CatalogHeader({
  slug,
  businessName,
  logoUrl,
  whatsappNumber,
  tagline,
}: CatalogHeaderProps) {
  const promo =
    tagline?.trim() ||
    "Browse products & enquire on WhatsApp — no checkout needed.";

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildCatalogEnquiryMessage(businessName),
  );

  return (
    <header className="sticky top-0 z-50 bg-[var(--catalog-header)] text-white">
      {/* Mobile */}
      <div className="mx-auto grid max-w-6xl grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 px-3 py-3 md:hidden">
        <a
          href="#catalog-search"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          aria-label="Jump to search"
        >
          <SearchIcon className="h-5 w-5 text-white" />
        </a>

        <Link
          href={`/${slug}`}
          className="flex min-w-0 items-center justify-center gap-2"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : null}
          <span className="truncate font-display text-sm font-bold uppercase tracking-wide">
            {businessName}
          </span>
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/10"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="h-5 w-5" />
        </a>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-6xl items-center justify-between gap-4 px-6 py-3 lg:px-8 md:flex">
        <Link href={`/${slug}`} className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={businessName}
              className="h-9 w-9 shrink-0 rounded-lg border border-white/20 object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--catalog-accent)] text-sm font-bold text-white">
              {businessName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate font-display text-base font-semibold tracking-tight">
            {businessName}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href="#products"
            className="inline-flex items-center rounded-full border border-white/20 px-3.5 py-1.5 text-sm font-medium text-white/90 transition hover:border-white/40 hover:bg-white/10"
          >
            Browse products
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--catalog-wa)] px-3.5 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* Promo strip — mobile only */}
      <p className="border-t border-white/10 bg-[var(--catalog-header)] px-3 py-1.5 text-center text-[11px] font-medium leading-snug text-[var(--catalog-promo)] md:hidden">
        {promo}
      </p>
    </header>
  );
}
