import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Privacy</h1>
        <p className="mt-4 text-slate-300">
          We store business catalog data and account information needed to run
          the service. We do not sell customer data. A full privacy policy will
          be published before general availability.
        </p>
      </section>
    </MarketingShell>
  );
}
