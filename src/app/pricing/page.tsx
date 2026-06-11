import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { PAID_PLAN_PRICE_INR, PLANS } from "@/lib/plans";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Simple pricing</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Start free. Upgrade when your catalog and team outgrow the limits.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="font-display text-xl font-semibold">Free</h2>
            <p className="mt-2 text-3xl font-bold">₹0</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li>{PLANS.free.maxProducts} products</li>
              <li>{PLANS.free.maxCategories} categories</li>
              <li>{PLANS.free.maxStaff} staff member</li>
              <li>{PLANS.free.maxDailyActivity} inventory updates / day</li>
            </ul>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Start free
            </Link>
          </div>

          <div className="rounded-2xl border border-orange-400/40 bg-orange-500/10 p-6">
            <h2 className="font-display text-xl font-semibold">Paid</h2>
            <p className="mt-2 text-3xl font-bold">
              ₹{PAID_PLAN_PRICE_INR}
              <span className="text-base font-normal text-slate-300">/month</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-200">
              <li>Up to {PLANS.paid.maxProducts} products</li>
              <li>Up to {PLANS.paid.maxCategories} categories</li>
              <li>Up to {PLANS.paid.maxStaff} staff members</li>
              <li>Unlimited daily inventory updates</li>
            </ul>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Upgrade from dashboard
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
