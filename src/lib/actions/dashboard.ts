"use server";

import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";

export async function getDashboardStats() {
  const { business, profile } = await requireBusinessContext();
  const limits = getPlanLimits(business.plan);

  return {
    productsCount: await repo.countProducts(business.id),
    categoriesCount: await repo.countCategories(business.id),
    staffCount: await repo.countStaff(business.id),
    activityToday: await repo.countDailyActivity(business.id),
    limits,
    lowStock: await repo.listLowStockProducts(
      business.id,
      LOW_STOCK_THRESHOLD,
      10,
    ),
    recentActivity: await repo.listRecentActivity(business.id, 10),
    business,
    profile,
  };
}
