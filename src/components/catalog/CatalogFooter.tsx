import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { buildWhatsAppUrl } from "@/lib/validation";

interface CatalogFooterProps {
  businessName: string;
  whatsappNumber: string;
  slug: string;
}

export function CatalogFooter({
  businessName,
  whatsappNumber,
  slug,
}: CatalogFooterProps) {
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello, I am interested in products from ${businessName}.`,
  );

  return (
    <footer className="mt-16 border-t border-stone-200/80 bg-[var(--catalog-header)] text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-xl font-semibold text-white">
              {businessName}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Browse our catalog and message us on WhatsApp — fast, friendly, and
              no online checkout required.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--catalog-wa)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Start a chat
            </a>
            <a
              href={`/${slug}`}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Back to catalog
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          <a href="/" className="text-slate-400 transition hover:text-white">
            Powered by Elevo
          </a>
          <span className="mx-2">·</span>
          © {year} {businessName}
        </p>
      </div>
    </footer>
  );
}
