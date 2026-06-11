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

function ProductPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-orange-50/40 text-stone-400">
      <svg
        className="h-9 w-9 opacity-50"
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

  return (
    <article
      className={`group flex flex-col overflow-hidden bg-white transition duration-300 md:catalog-card ${
        selected
          ? "ring-2 ring-[var(--catalog-accent)] ring-offset-2 ring-offset-white md:ring-offset-[var(--catalog-bg)]"
          : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50 md:aspect-[4/3]">
        <Link href={productPath} className="block h-full w-full">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105 md:object-cover md:p-0"
            />
          ) : (
            <ProductPlaceholder />
          )}
        </Link>

        {categoryName ? (
          <span className="absolute left-2 top-2 hidden rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--catalog-ink)] shadow-sm backdrop-blur-sm md:left-3 md:top-3 md:inline md:px-2.5 md:py-1">
            {categoryName}
          </span>
        ) : null}

        <label
          className={`absolute right-2 top-2 flex cursor-pointer items-center rounded-full bg-white/95 p-1.5 shadow-sm backdrop-blur-sm transition md:right-3 md:top-3 md:gap-1.5 md:px-2 md:py-1.5 ${
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
          <span className="hidden text-[10px] font-semibold text-[var(--catalog-ink)] md:inline">
            Select
          </span>
        </label>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-2 pt-2 md:p-4">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-stone-900 md:text-base">
          <Link href={productPath} className="hover:text-[var(--catalog-accent)]">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-bold text-stone-900 md:mt-2 md:text-lg">
          {product.price_text}
        </p>
        {product.description ? (
          <p className="mt-2 hidden line-clamp-2 text-xs leading-relaxed text-[var(--catalog-muted)] md:block">
            {product.description}
          </p>
        ) : null}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-full items-center justify-center bg-stone-200 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-stone-900 transition hover:bg-stone-300 md:hidden"
        >
          Enquire
        </a>

        <div className="mt-4 hidden gap-2 pt-1 md:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--catalog-wa)] text-sm font-semibold text-white transition hover:brightness-110"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            Enquire
          </a>
          <Link
            href={productPath}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-semibold text-[var(--catalog-ink)] transition hover:border-[var(--catalog-accent)]/40 hover:text-[var(--catalog-accent)]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
