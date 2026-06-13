import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminNav";
import { DashboardStatLink } from "@/components/admin/DashboardStatLink";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { CatalogThemePicker } from "@/components/catalog/CatalogThemePicker";
import { ShareCatalog } from "@/components/catalog/ShareCatalog";
import { Card } from "@/components/ui/Form";
import { getDashboardStats } from "@/lib/actions/dashboard";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatActionType(actionType: string): string {
  switch (actionType) {
    case "SALE":
      return "Sale";
    case "STOCK_ADDED":
      return "Stock added";
    case "MANUAL_ADJUSTMENT":
      return "Adjusted";
    default:
      return actionType.replace(/_/g, " ").toLowerCase();
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const catalogUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${stats.business.slug}`;
  const lowStockCount = stats.lowStock.length;

  const statCards = [
    { label: "Products", value: stats.productsCount, href: "/products" },
    { label: "Categories", value: stats.categoriesCount, href: "/categories" },
    {
      label: "Staff",
      value: stats.staffCount,
      href: stats.profile.role === "admin" ? "/staff" : "/dashboard",
    },
    {
      label: "Low stock",
      value: lowStockCount,
      href: "/inventory",
      alert: lowStockCount > 0,
    },
  ];

  return (
    <AdminShell
      title="Dashboard"
      businessName={stats.business.name}
      role={stats.profile.role}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-navy to-brand-navy-light px-5 py-5 text-white shadow-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-orange">
            Overview
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
            {stats.productsCount === 0
              ? "Your catalog is empty. Add your first product to start sharing."
              : lowStockCount > 0
                ? `${stats.productsCount} products live · ${lowStockCount} need restocking`
                : `${stats.productsCount} products live · stock looks healthy`}
          </p>
          {stats.profile.role === "admin" && stats.productsCount === 0 ? (
            <Link
              href="/products/new"
              className="mt-4 inline-flex min-h-10 items-center rounded-full bg-brand-orange px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-orange-dark"
            >
              Add first product
            </Link>
          ) : null}
        </div>

        {stats.profile.role === "admin" ? (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
                Plan: {stats.business.plan}
              </p>
              {stats.business.plan === "free" ? (
                <Link
                  href="/pricing"
                  className="text-xs font-semibold text-brand-navy hover:text-brand-orange"
                >
                  Upgrade →
                </Link>
              ) : null}
            </div>
            <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li>
                Products: {stats.productsCount}
                {stats.limits.maxProducts < 9999
                  ? ` / ${stats.limits.maxProducts}`
                  : ""}
              </li>
              <li>
                Categories: {stats.categoriesCount}
                {stats.limits.maxCategories < 9999
                  ? ` / ${stats.limits.maxCategories}`
                  : ""}
              </li>
              <li>
                Staff: {stats.staffCount}
                {stats.limits.maxStaff < 9999 ? ` / ${stats.limits.maxStaff}` : ""}
              </li>
              <li>
                Activity today: {stats.activityToday}
                {stats.limits.maxDailyActivity < 9999
                  ? ` / ${stats.limits.maxDailyActivity}`
                  : ""}
              </li>
            </ul>
            {stats.business.plan === "free" &&
            (stats.productsCount >= stats.limits.maxProducts ||
              stats.categoriesCount >= stats.limits.maxCategories ||
              stats.staffCount >= stats.limits.maxStaff ||
              stats.activityToday >= stats.limits.maxDailyActivity) ? (
              <div className="mt-4">
                <UpgradePrompt
                  message="You have reached a free plan limit. Upgrade to add more products, staff, or daily inventory updates."
                  plan={stats.business.plan}
                />
              </div>
            ) : null}
          </Card>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {statCards.map((stat) => (
            <DashboardStatLink
              key={stat.label}
              href={stat.href}
              label={stat.label}
              value={stat.value}
              alert={stat.alert}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-orange">
              Your catalog
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Share this link with customers — they browse and enquire on WhatsApp.
            </p>
            {stats.profile.role === "admin" ? (
              <Link
                href="/settings"
                className="mt-2 inline-block text-xs font-semibold uppercase tracking-wide text-brand-orange hover:underline"
              >
                Edit business profile →
              </Link>
            ) : null}
            <Link
              href={`/${stats.business.slug}`}
              target="_blank"
              className="mt-3 block break-all rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-brand-navy ring-1 ring-slate-200 transition hover:text-brand-orange"
            >
              {catalogUrl}
            </Link>
            <div className="mt-4">
              <ShareCatalog
                catalogUrl={catalogUrl}
                businessName={stats.business.name}
                whatsappNumber={stats.business.whatsapp_number}
              />
            </div>
            <CatalogThemePicker
              currentTheme={stats.business.catalog_theme}
              catalogUrl={catalogUrl}
              isAdmin={stats.profile.role === "admin"}
            />
          </Card>

          <div className="space-y-6 lg:col-span-2">
            {stats.lowStock.length > 0 ? (
              <Card className="border-brand-orange/20">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-bold uppercase text-brand-navy">
                    Needs restock
                  </h2>
                  <Link
                    href="/inventory"
                    className="text-xs font-semibold uppercase tracking-wide text-brand-orange hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {stats.lowStock.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-700">{item.name}</span>
                      <span className="shrink-0 rounded-full bg-brand-orange/10 px-2 py-0.5 text-xs font-semibold text-brand-orange">
                        {item.stock_quantity} left
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card>
                <h2 className="font-display text-base font-bold uppercase text-brand-navy">
                  Stock status
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  No low-stock alerts right now.
                </p>
              </Card>
            )}

            {stats.recentActivity.length > 0 ? (
              <Card>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-base font-bold uppercase text-brand-navy">
                    Recent activity
                  </h2>
                  <Link
                    href="/activity"
                    className="text-xs font-semibold uppercase tracking-wide text-brand-orange hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="mt-3 space-y-3">
                  {stats.recentActivity.slice(0, 5).map((log) => {
                    const product = log.products as { name?: string } | null;
                    const positive = log.change_amount > 0;
                    return (
                      <li key={log.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {product?.name ?? "Product"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatActionType(log.action_type)} ·{" "}
                            {formatRelativeTime(log.timestamp)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-semibold tabular-nums ${
                            positive ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {positive ? "+" : ""}
                          {log.change_amount}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ) : (
              <Card>
                <h2 className="font-display text-base font-bold uppercase text-brand-navy">
                  Recent activity
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Inventory changes will show up here.
                </p>
              </Card>
            )}
          </div>
        </div>

        {stats.profile.role === "admin" && stats.productsCount > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/products/new"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-orange px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-orange-dark"
            >
              Add product
            </Link>
            <Link
              href="/categories"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-slate-300 px-5 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50"
            >
              Manage categories
            </Link>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
