import { AdminShellSkeleton } from "./AdminShellSkeleton";
import { SkeletonBlock } from "./SkeletonBlock";

interface AdminListSkeletonProps {
  rows?: number;
  showActionButton?: boolean;
  narrow?: boolean;
  navCount?: number;
}

export function AdminListSkeleton({
  rows = 5,
  showActionButton = false,
  narrow = false,
  navCount,
}: AdminListSkeletonProps) {
  return (
    <AdminShellSkeleton navCount={navCount ?? (showActionButton ? 7 : 5)}>
      <div className={`space-y-4 ${narrow ? "mx-auto max-w-lg" : ""}`}>
        {showActionButton ? (
          <SkeletonBlock className="h-11 w-36 rounded-full" />
        ) : null}
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-5 w-40" />
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-3 w-32" />
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <SkeletonBlock className="h-4 w-10" />
                  <SkeletonBlock className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShellSkeleton>
  );
}
