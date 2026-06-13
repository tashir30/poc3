import { notFound } from "next/navigation";
import * as repo from "@/lib/db/repo";
import { CatalogHero } from "@/components/catalog/CatalogHero";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";
import { CatalogShell } from "@/components/catalog/CatalogShell";

export const revalidate = 60;

export default async function PublicCatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await repo.getCatalogPageBySlug(slug);

  if (!page) notFound();

  const { business, products, categories } = page;

  return (
    <CatalogShell business={business} showFloatingWhatsApp={false}>
      <CatalogHero
        businessName={business.name}
        description={business.description}
        productCount={products.length}
        categoryCount={categories.length}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <CatalogPageClient
          slug={slug}
          products={products}
          categories={categories}
          whatsappNumber={business.whatsapp_number}
          businessName={business.name}
        />
      </div>
    </CatalogShell>
  );
}
