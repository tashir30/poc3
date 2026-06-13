import { AdminShellSkeleton } from "./AdminShellSkeleton";
import { SkeletonBlock } from "./SkeletonBlock";

export function SettingsSkeleton() {
  return (
    <AdminShellSkeleton>
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock
                className={`w-full rounded-xl ${i === 3 ? "h-20" : "h-11"}`}
              />
            </div>
          ))}
          <SkeletonBlock className="h-11 w-full rounded-full" />
        </div>
      </div>
    </AdminShellSkeleton>
  );
}
