"use client";

import { useMemo, useState } from "react";
import type { Category, PublicProduct } from "@/types/database";
import {
  CatalogFiltersBar,
  type CatalogFilters,
} from "./CatalogFiltersBar";
import { PublicProductCard } from "./PublicProductCard";

interface CatalogBrowserProps {
  slug: string;
  products: PublicProduct[];
  categories: Category[];
  businessName: string;
  whatsappNumber: string;
  selectedIds: Set<string>;
  onToggleProduct: (productId: string) => void;
  selectionActive: boolean;
  selectionLimitReached: boolean;
}

function filterAndSortProducts(
  products: PublicProduct[],
  filters: CatalogFilters,
  categoryMap: Map<string, string>,
): PublicProduct[] {
  const q = filters.query.trim().toLowerCase();

  let result = products.filter((product) => {
    const categoryName = product.category_id
      ? categoryMap.get(product.category_id)?.toLowerCase() ?? ""
      : "";
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      categoryName.includes(q);
    const matchesCategory =
      !filters.categoryId || product.category_id === filters.categoryId;
    return matchesQuery && matchesCategory;
  });

  result = [...result];
  switch (filters.sort) {
    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      result.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "latest":
    default:
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      break;
  }

  return result;
}

function hasActiveFilters(filters: CatalogFilters): boolean {
  return filters.query.length > 0 || filters.categoryId.length > 0;
}

export function CatalogBrowser({
  slug,
  products,
  categories,
  businessName,
  whatsappNumber,
  selectedIds,
  onToggleProduct,
  selectionActive,
  selectionLimitReached,
}: CatalogBrowserProps) {
  const [filters, setFilters] = useState<CatalogFilters>({
    query: "",
    categoryId: "",
    sort: "latest",
  });

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const filtered = useMemo(
    () => filterAndSortProducts(products, filters, categoryMap),
    [products, filters, categoryMap],
  );

  const filtersActive = hasActiveFilters(filters);
  const catalogEmpty = products.length === 0;
  const noFilterMatches = !catalogEmpty && filtered.length === 0;

  return (
    <section
      id="products"
      className={`scroll-mt-32 bg-white md:scroll-mt-24 md:bg-transparent ${
        selectionActive ? "pb-28" : "pb-6"
      }`}
    >
      {!catalogEmpty ? (
        <CatalogFiltersBar
          filters={filters}
          categories={categories}
          onChange={setFilters}
          resultCount={filtered.length}
        />
      ) : null}

      {selectionLimitReached ? (
        <p className="mx-2 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 md:mx-0 md:text-sm">
          Maximum 20 products per enquiry. Deselect one to add another.
        </p>
      ) : null}

      {catalogEmpty ? (
        <div className="catalog-card mx-2 flex flex-col items-center px-6 py-20 text-center md:mx-0">
          <p className="font-display text-2xl font-semibold text-[var(--catalog-ink)]">
            Coming soon
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--catalog-muted)]">
            We&apos;re setting up our catalog. Check back shortly or message us
            on WhatsApp.
          </p>
        </div>
      ) : noFilterMatches ? (
        <div className="mx-2 flex flex-col items-center px-6 py-16 text-center md:mx-0 md:catalog-card md:py-20">
          <p className="text-lg font-semibold text-stone-900">No results</p>
          <p className="mt-2 max-w-md text-sm text-stone-500">
            Nothing matches your search or category.
          </p>
          {filtersActive ? (
            <button
              type="button"
              onClick={() =>
                setFilters({ query: "", categoryId: "", sort: filters.sort })
              }
              className="mt-6 rounded-lg border border-stone-300 bg-stone-100 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-stone-800"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-2 pt-3 sm:gap-5 sm:px-0 sm:pt-0 lg:grid-cols-3 lg:gap-6">
          {filtered.map((product) => (
            <PublicProductCard
              key={product.id}
              slug={slug}
              product={product}
              businessName={businessName}
              whatsappNumber={whatsappNumber}
              selected={selectedIds.has(product.id)}
              onToggleSelect={onToggleProduct}
              selectionActive={selectionActive}
              categoryName={
                product.category_id
                  ? categoryMap.get(product.category_id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
