import { MarketingShell } from "@/components/marketing/MarketingShell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Terms of use</h1>
        <p className="mt-4 text-slate-300">
          Elevo is provided as a proof-of-concept platform. Use responsibly and
          keep your login credentials secure. Full legal terms will be published
          before general availability.
        </p>
      </section>
    </MarketingShell>
  );
}
