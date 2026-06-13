import { DEFAULT_CATALOG_TAGLINE } from "@/lib/constants";

interface CatalogHeroProps {
  businessName: string;
  description?: string | null;
  productCount: number;
  categoryCount: number;
}

export function CatalogHero({
  businessName,
  description,
  productCount,
  categoryCount,
}: CatalogHeroProps) {
  const tagline = description?.trim() || DEFAULT_CATALOG_TAGLINE;

  return (
    <section className="catalog-gradient-mesh relative hidden overflow-hidden text-white md:block">
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-xl font-bold tracking-tight lg:text-2xl">
            {businessName}
          </h1>
          <p className="mt-1 line-clamp-1 max-w-2xl text-sm text-slate-300">
            {tagline}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 backdrop-blur-sm">
            {productCount} {productCount === 1 ? "product" : "products"}
          </span>
          {categoryCount > 0 ? (
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 backdrop-blur-sm">
              {categoryCount} {categoryCount === 1 ? "category" : "categories"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-[var(--catalog-accent)] via-[var(--catalog-hero-accent-line)] to-[var(--catalog-wa)]" />
    </section>
  );
}
