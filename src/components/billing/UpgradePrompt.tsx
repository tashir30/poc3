import Link from "next/link";
import { devActivatePaidPlan } from "@/lib/actions/billing";
import type { BusinessPlanId } from "@/lib/plans";
import { PAID_PLAN_PRICE_INR } from "@/lib/plans";

interface UpgradePromptProps {
  message: string;
  plan: BusinessPlanId;
}

export function UpgradePrompt({ message, plan }: UpgradePromptProps) {
  if (plan === "paid") {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>{message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href="/pricing"
          className="font-semibold text-brand-navy hover:text-brand-orange"
        >
          View plans (₹{PAID_PLAN_PRICE_INR}/mo)
        </Link>
        {process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_ELEVO_DEV_AUTH === "true" ? (
          <form action={devActivatePaidPlan}>
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wide text-emerald-700 hover:underline"
            >
              Dev: activate paid
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
