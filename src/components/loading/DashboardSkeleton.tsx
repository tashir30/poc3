import { AdminShellSkeleton } from "./AdminShellSkeleton";
import { SkeletonBlock } from "./SkeletonBlock";

export function DashboardSkeleton() {
  return (
    <AdminShellSkeleton>
      <div className="space-y-6">
        <SkeletonBlock className="h-28 rounded-2xl" />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-3 w-20" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-4 w-full max-w-[12rem]" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-3 h-4 w-full max-w-md" />
            <SkeletonBlock className="mt-4 h-11 w-full rounded-lg" />
            <SkeletonBlock className="mt-4 h-10 w-32 rounded-full" />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SkeletonBlock className="h-4 w-32" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <SkeletonBlock className="h-4 w-24" />
                    <SkeletonBlock className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SkeletonBlock className="h-4 w-36" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShellSkeleton>
  );
}
