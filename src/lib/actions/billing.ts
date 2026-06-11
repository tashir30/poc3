"use server";

import { revalidatePath } from "next/cache";
import * as repo from "@/lib/db/repo";
import { PAID_PLAN_PRICE_INR } from "@/lib/plans";
import { requireMerchantAdmin } from "@/lib/session";

export async function devActivatePaidPlan(): Promise<void> {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.ELEVO_DEV_AUTH !== "true"
  ) {
    return;
  }

  const { business, profile } = await requireMerchantAdmin();
  await repo.updateBusinessPlan(business.id, "paid", "active");
  await repo.insertSubscription({
    businessId: business.id,
    userPhone: profile.phone,
    amountPaise: PAID_PLAN_PRICE_INR * 100,
    status: "paid",
  });

  revalidatePath("/dashboard");
  revalidatePath("/pricing");
}
