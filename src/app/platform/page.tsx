import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminNav";
import { Card } from "@/components/ui/Form";
import * as repo from "@/lib/db/repo";
import { requirePlatformAdmin } from "@/lib/session";

export default async function PlatformAdminPage() {
  await requirePlatformAdmin();
  const stats = await repo.getPlatformStats();
  const businesses = await repo.listPlatformBusinesses(25);

  return (
    <AdminShell title="Elevo Platform" businessName="Platform admin" role="admin">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs font-bold uppercase text-brand-orange">Businesses</p>
            <p className="font-display mt-1 text-3xl font-bold">{stats.totalBusinesses}</p>
          </Card>
          <Card>
            <p className="text-xs font-bold uppercase text-brand-orange">Free</p>
            <p className="font-display mt-1 text-3xl font-bold">{stats.freeBusinesses}</p>
          </Card>
          <Card>
            <p className="text-xs font-bold uppercase text-brand-orange">Paid</p>
            <p className="font-display mt-1 text-3xl font-bold">{stats.paidBusinesses}</p>
          </Card>
          <Card>
            <p className="text-xs font-bold uppercase text-brand-orange">Revenue</p>
            <p className="font-display mt-1 text-3xl font-bold">
              ₹{(stats.totalRevenuePaise / 100).toLocaleString("en-IN")}
            </p>
          </Card>
        </div>

        <Card>
          <h2 className="font-display text-lg font-bold uppercase text-brand-navy">
            Recent businesses
          </h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {businesses.map((business) => (
              <li key={business.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{business.name}</p>
                  <p className="text-xs text-slate-500">
                    /{business.slug} · {business.owner_phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase">
                    {business.plan}
                  </span>
                  <Link
                    href={`/${business.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-brand-orange hover:underline"
                  >
                    Catalog
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}
