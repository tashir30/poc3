import Link from "next/link";
import { notFound } from "next/navigation";
import * as repo from "@/lib/db/repo";
import { CatalogShell } from "@/components/catalog/CatalogShell";
import { ProductImageGallery } from "@/components/catalog/ProductImageGallery";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { buildProductEnquiryMessage, buildWhatsAppUrl } from "@/lib/validation";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const page = await repo.getPublicProductPageBySlug(slug, id);

  if (!page) notFound();

  const { business, product, category } = page;

  const whatsappUrl = buildWhatsAppUrl(
    business.whatsapp_number,
    buildProductEnquiryMessage(
      product.name,
      business.name,
      product.price_text,
    ),
  );

  return (
    <CatalogShell business={business} showFloatingWhatsApp={false}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--catalog-muted)]">
          <Link
            href={`/${slug}`}
            className="font-medium transition hover:text-[var(--catalog-accent)]"
          >
            {business.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--catalog-ink)]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery
            images={product.image_urls}
            alt={product.name}
          />

          <div className="flex flex-col justify-center">
            {category ? (
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--catalog-accent)]">
                {category.name}
              </p>
            ) : null}
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--catalog-ink)] sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-2xl font-bold text-[var(--catalog-ink)] sm:text-3xl">
              {product.price_text}
            </p>
            {product.description ? (
              <p className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--catalog-muted)]">
                {product.description}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--catalog-wa)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Enquire on WhatsApp
              </a>
              <Link
                href={`/${slug}`}
                className="inline-flex min-h-12 items-center rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-[var(--catalog-ink)] transition hover:border-[var(--catalog-accent)]/40"
              >
                Back to catalog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CatalogShell>
  );
}
