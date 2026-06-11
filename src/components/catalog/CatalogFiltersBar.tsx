"use client";

import type { Category } from "@/types/database";
import { SearchIcon } from "@/components/shared/SearchIcon";

export type CatalogSort = "latest" | "name-asc" | "name-desc";

export interface CatalogFilters {
  query: string;
  categoryId: string;
  sort: CatalogSort;
}

interface CatalogFiltersBarProps {
  filters: CatalogFilters;
  categories: Category[];
  onChange: (filters: CatalogFilters) => void;
  resultCount: number;
}

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "name-asc", label: "A → Z" },
  { value: "name-desc", label: "Z → A" },
];

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-3.5 w-3.5 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function CatalogFiltersBar({
  filters,
  categories,
  onChange,
  resultCount,
}: CatalogFiltersBarProps) {
  const hasActiveFilters =
    filters.query.length > 0 || filters.categoryId.length > 0;

  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const sectionTitle = activeCategory?.name ?? "All products";

  function clearFilters() {
    onChange({ query: "", categoryId: "", sort: filters.sort });
  }

  const chipActive = "bg-[var(--catalog-ink)] text-white";
  const chipInactive = "bg-stone-100 text-stone-700";

  return (
    <>
      {/* ——— Mobile ——— */}
      <div
        id="catalog-search"
        className="sticky top-[calc(52px+2.5rem)] z-40 scroll-mt-[calc(52px+2.5rem)] border-b border-stone-200 bg-white md:hidden"
      >
        {categories.length > 0 ? (
          <div className="border-b border-stone-100">
            <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-none">
              <button
                type="button"
                onClick={() => onChange({ ...filters, categoryId: "" })}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  !filters.categoryId ? chipActive : chipInactive
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const active = filters.categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        categoryId: active ? "" : cat.id,
                      })
                    }
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      active ? chipActive : chipInactive
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="space-y-2 px-3 py-2.5">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) =>
                onChange({
                  ...filters,
                  query: e.target.value.slice(0, 100),
                })
              }
              placeholder="Search by name or category..."
              maxLength={100}
              aria-label="Search products"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-stone-500">
              <span className="font-semibold text-stone-800">{sectionTitle}</span>
              {" · "}
              {resultCount} {resultCount === 1 ? "item" : "items"}
            </p>

            <div className="relative shrink-0">
              <select
                value={filters.sort}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    sort: e.target.value as CatalogSort,
                  })
                }
                aria-label="Sort products"
                className="appearance-none rounded-lg border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-stone-800 focus:border-stone-400 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.value === "latest" ? "Featured" : opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-stone-500 underline-offset-2 hover:text-stone-800 hover:underline"
            >
              Clear search & filters
            </button>
          ) : null}
        </div>
      </div>

      {/* ——— Desktop: compact toolbar ——— */}
      <div
        id="catalog-search"
        className="sticky top-[49px] z-30 mb-4 mt-2 hidden scroll-mt-16 md:block"
      >
        <div className="catalog-card px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[12rem] flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) =>
                  onChange({ ...filters, query: e.target.value.slice(0, 100) })
                }
                placeholder="Search products..."
                maxLength={100}
                aria-label="Search products"
                className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pl-9 pr-3 text-sm text-[var(--catalog-ink)] placeholder:text-stone-400 focus:border-stone-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="relative">
              <select
                value={filters.sort}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    sort: e.target.value as CatalogSort,
                  })
                }
                aria-label="Sort products"
                className="appearance-none rounded-lg border border-stone-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-[var(--catalog-ink)] focus:border-stone-300 focus:outline-none"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Clear
              </button>
            ) : null}

            <span className="ml-auto text-xs tabular-nums text-[var(--catalog-muted)]">
              {resultCount} {resultCount === 1 ? "item" : "items"}
            </span>
          </div>

          {categories.length > 0 ? (
            <div className="relative mt-2 border-t border-stone-100 pt-2">
              <div className="pointer-events-none absolute inset-y-2 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent" />
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, categoryId: "" })}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    !filters.categoryId
                      ? "bg-[var(--catalog-ink)] text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => {
                  const active = filters.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...filters,
                          categoryId: active ? "" : cat.id,
                        })
                      }
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? "bg-[var(--catalog-ink)] text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
