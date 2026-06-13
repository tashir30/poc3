import Link from "next/link";
import type { PublicProduct } from "@/types/database";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import {
  buildProductEnquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/validation";

interface PublicProductCardProps {
  slug: string;
  product: PublicProduct;
  categoryName?: string;
  businessName: string;
  whatsappNumber: string;
  selected: boolean;
  onToggleSelect: (productId: string) => void;
  selectionActive: boolean;
}

function isContactPrice(priceText: string): boolean {
  return /contact/i.test(priceText.trim());
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-white text-stone-300">
      <svg
        className="h-9 w-9 opacity-60"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.25}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
    </div>
  );
}

export function PublicProductCard({
  slug,
  product,
  categoryName,
  businessName,
  whatsappNumber,
  selected,
  onToggleSelect,
  selectionActive,
}: PublicProductCardProps) {
  const productPath = `/${slug}/product/${product.id}`;
  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildProductEnquiryMessage(product.name, businessName, product.price_text),
  );
  const contactPrice = isContactPrice(product.price_text);

  return (
    <article
      className={`catalog-product-tile group flex flex-col overflow-hidden transition duration-200 ${
        selected
          ? "ring-2 ring-[var(--catalog-accent)] ring-offset-2 ring-offset-white md:ring-offset-[var(--catalog-bg)]"
          : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-white md:aspect-[4/3]">
        <Link href={productPath} className="block h-full w-full">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.02] md:p-4"
            />
          ) : (
            <ProductPlaceholder />
          )}
        </Link>

        {categoryName ? (
          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-3rem)] truncate rounded-sm bg-[var(--catalog-ink)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white md:left-3 md:top-3">
            {categoryName}
          </span>
        ) : null}

        <label
          className={`absolute right-2.5 top-2.5 flex cursor-pointer items-center rounded-sm border border-stone-200 bg-white p-1.5 transition md:right-3 md:top-3 md:gap-1.5 md:px-2 md:py-1.5 ${
            selectionActive || selected
              ? "opacity-100"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(product.id)}
            className="h-3.5 w-3.5 rounded border-stone-300 text-[var(--catalog-accent)] focus:ring-[var(--catalog-accent)]/30"
            aria-label={`Select ${product.name}`}
          />
          <span className="hidden text-[10px] font-medium text-[var(--catalog-ink)] md:inline">
            Select
          </span>
        </label>
      </div>

      <div className="flex flex-1 flex-col border-t border-stone-100 p-3 md:p-4">
        <h3 className="line-clamp-2 text-left text-base font-semibold leading-snug text-[var(--catalog-ink)] md:text-lg">
          <Link
            href={productPath}
            className="hover:text-[var(--catalog-accent)]"
          >
            {product.name}
          </Link>
        </h3>

        <p
          className={`mt-1.5 text-left tabular-nums md:mt-2 ${
            contactPrice
              ? "text-xs font-medium text-[var(--catalog-muted)] md:text-sm"
              : "text-sm font-bold text-[var(--catalog-ink)] md:text-base"
          }`}
        >
          {product.price_text}
        </p>

        {product.description ? (
          <p className="mt-2 line-clamp-1 text-left text-xs leading-relaxed text-[var(--catalog-muted)]">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto pt-3 md:pt-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--catalog-ink)] text-xs font-semibold uppercase tracking-wide text-white transition hover:opacity-90 md:min-h-11 md:text-sm"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Enquire</span>
            <span className="hidden sm:inline">Enquire on WhatsApp</span>
          </a>
          <Link
            href={productPath}
            className="mt-2 block text-center text-xs font-medium text-[var(--catalog-muted)] underline-offset-2 transition hover:text-[var(--catalog-accent)] hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
