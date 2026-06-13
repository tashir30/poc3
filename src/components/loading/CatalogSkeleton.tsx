import { SkeletonBlock } from "./SkeletonBlock";

function CatalogHeaderSkeleton() {
  return (
    <header className="bg-[#1a2744]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full bg-white/20" />
          <div className="min-w-0 space-y-2">
            <SkeletonBlock className="h-5 w-32 bg-white/20" />
            <SkeletonBlock className="hidden h-3 w-48 bg-white/15 sm:block" />
          </div>
        </div>
        <SkeletonBlock className="h-10 w-24 shrink-0 rounded-full bg-white/20" />
      </div>
    </header>
  );
}

function CatalogHeroSkeleton() {
  return (
    <section className="hidden bg-gradient-to-br from-[#1a2744] to-[#243656] md:block">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-8">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48 bg-white/20" />
          <SkeletonBlock className="h-4 w-72 max-w-full bg-white/15" />
        </div>
        <div className="flex gap-4">
          <SkeletonBlock className="h-10 w-20 rounded-lg bg-white/15" />
          <SkeletonBlock className="h-10 w-20 rounded-lg bg-white/15" />
        </div>
      </div>
    </section>
  );
}

function CatalogProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-4 px-2 pt-3 sm:gap-5 sm:px-0 sm:pt-0 lg:grid-cols-3 lg:gap-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <SkeletonBlock className="aspect-square w-full rounded-none" />
          <div className="space-y-2 p-3">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="catalog-site flex min-h-full flex-col bg-stone-50">
      <CatalogHeaderSkeleton />
      <main className="flex-1">
        <CatalogHeroSkeleton />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 mt-4 space-y-3 md:mt-6">
            <SkeletonBlock className="h-11 w-full rounded-xl" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-9 w-24 rounded-full" />
              <SkeletonBlock className="h-9 w-24 rounded-full" />
              <SkeletonBlock className="h-9 w-24 rounded-full" />
            </div>
          </div>
          <CatalogProductGridSkeleton />
        </div>
      </main>
      <footer className="mt-auto border-t border-stone-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
      </footer>
    </div>
  );
}

export function CatalogProductSkeleton() {
  return (
    <div className="catalog-site flex min-h-full flex-col bg-stone-50">
      <CatalogHeaderSkeleton />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-8 flex items-center gap-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-4 rounded-full" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <SkeletonBlock className="aspect-square w-full rounded-2xl lg:aspect-[4/3]" />
            <div className="flex flex-col justify-center space-y-4">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-10 w-3/4 max-w-sm" />
              <SkeletonBlock className="h-8 w-28" />
              <SkeletonBlock className="h-20 w-full max-w-md" />
              <div className="flex flex-wrap gap-3 pt-2">
                <SkeletonBlock className="h-12 w-44 rounded-full" />
                <SkeletonBlock className="h-12 w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
