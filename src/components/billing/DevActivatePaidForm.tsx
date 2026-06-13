"use client";

import { devActivatePaidPlan } from "@/lib/actions/billing";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function DevActivatePaidForm() {
  return (
    <form action={devActivatePaidPlan}>
      <SubmitButton
        pendingLabel="Activating..."
        className="text-xs font-semibold uppercase tracking-wide text-emerald-700 hover:underline"
        variant="secondary"
      >
        Dev: activate paid
      </SubmitButton>
    </form>
  );
}
