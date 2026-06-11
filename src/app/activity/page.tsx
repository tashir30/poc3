import { AdminShell } from "@/components/admin/AdminNav";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";

export default async function ActivityPage() {
  const { business, profile } = await requireBusinessContext();
  const logs = await repo.listActivityLogs(business.id, 50);

  return (
    <AdminShell title="Activity" businessName={business.name} role={profile.role}>
      <div className="mx-auto max-w-lg space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
          >
            <p className="font-display font-semibold uppercase text-brand-navy">
              {log.products.name}
            </p>
            <p className="text-slate-600">
              {log.change_amount > 0 ? "+" : ""}
              {log.change_amount} · {log.action_type}
            </p>
            <p className="text-xs text-slate-500">
              {log.profiles.name ?? log.profiles.phone} ·{" "}
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center text-slate-600">
            No inventory changes yet.
          </p>
        )}
      </div>
    </AdminShell>
  );
}
