import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
          Catalog + inventory
        </p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Your product catalog on WhatsApp — with stock your team can manage
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
          Elevo helps small businesses share a beautiful mobile catalog, take
          enquiries on WhatsApp, and track inventory with one tap — no checkout
          complexity.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Create free catalog
          </Link>
          <Link
            href="/pricing"
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "Share your catalog",
              body: "Get a link customers can browse on mobile. Search, categories, and WhatsApp enquiry built in.",
            },
            {
              title: "Manage stock",
              body: "Tap [-1] [+1] to update inventory. Activity is logged for your team.",
            },
            {
              title: "Add staff",
              body: "Give counter staff a username login for inventory — you keep full admin control.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 p-5">
              <h2 className="font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold">Free to start</h2>
        <p className="mt-2 text-slate-300">
          50 products · 5 categories · 1 staff · 10 inventory updates per day
        </p>
        <Link href="/login" className="mt-6 inline-block text-orange-300 hover:text-orange-200">
          Get started →
        </Link>
      </section>
    </MarketingShell>
  );
}
