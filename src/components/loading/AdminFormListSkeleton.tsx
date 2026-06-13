import { AdminShellSkeleton } from "./AdminShellSkeleton";
import { SkeletonBlock } from "./SkeletonBlock";

interface AdminFormListSkeletonProps {
  listRows?: number;
  formFields?: number;
}

export function AdminFormListSkeleton({
  listRows = 4,
  formFields = 2,
}: AdminFormListSkeletonProps) {
  return (
    <AdminShellSkeleton>
      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: formFields }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBlock className="h-3 w-24" />
                <SkeletonBlock className="h-11 w-full rounded-xl" />
              </div>
            ))}
            <SkeletonBlock className="h-11 w-full rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: listRows }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-4 w-48" />
              </div>
              <SkeletonBlock className="h-8 w-16 shrink-0 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </AdminShellSkeleton>
  );
}
