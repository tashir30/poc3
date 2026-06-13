"use server";

import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";

export async function getDashboardStats() {
  const { business, profile } = await requireBusinessContext();
  const limits = getPlanLimits(business.plan);

  const [
    productsCount,
    categoriesCount,
    staffCount,
    activityToday,
    lowStock,
    recentActivity,
  ] = await Promise.all([
    repo.countProducts(business.id),
    repo.countCategories(business.id),
    repo.countStaff(business.id),
    repo.countDailyActivity(business.id),
    repo.listLowStockProducts(business.id, LOW_STOCK_THRESHOLD, 10),
    repo.listRecentActivity(business.id, 10),
  ]);

  return {
    productsCount,
    categoriesCount,
    staffCount,
    activityToday,
    limits,
    lowStock,
    recentActivity,
    business,
    profile,
  };
}
