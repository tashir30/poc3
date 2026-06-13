import { SkeletonBlock } from "./SkeletonBlock";

export function AdminShellSkeleton({
  children,
  navCount = 7,
}: {
  children: React.ReactNode;
  navCount?: number;
}) {
  return (
    <div className="min-h-full bg-background">
      <div className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="min-w-0 space-y-2">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-6 w-40" />
          </div>
          <SkeletonBlock className="h-10 w-20 rounded-full" />
        </div>
        <div className="h-0.5 bg-brand-orange/30" aria-hidden="true" />
      </div>
      <div className="border-b border-slate-200 bg-white px-2 py-2 sm:px-4">
        <div className="mx-auto flex max-w-7xl gap-2">
          {Array.from({ length: navCount }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
    </div>
  );
}
