"use server";

import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";

export async function getDashboardStats() {
  const { business, profile } = await requireBusinessContext();
  const limits = getPlanLimits(business.plan);

  const snapshot = await repo.getDashboardSnapshot(
    business.id,
    LOW_STOCK_THRESHOLD,
    10,
    10,
  );

  return {
    ...snapshot,
    limits,
    business,
    profile,
  };
}
