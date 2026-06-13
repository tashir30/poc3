export function AdminLoadingSkeleton() {
  return (
    <div className="min-h-full animate-pulse bg-background">
      <div className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0 space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-6 w-40 rounded bg-slate-200" />
          </div>
          <div className="h-10 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="h-0.5 bg-slate-200" />
      </div>
      <div className="border-b border-slate-200 bg-white px-2 py-2 sm:px-4">
        <div className="mx-auto flex max-w-7xl gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shrink-0 rounded-full bg-slate-200" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="h-28 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
