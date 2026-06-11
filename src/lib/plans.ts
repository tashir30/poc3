export type BusinessPlanId = "free" | "paid";

export interface PlanLimits {
  maxCategories: number;
  maxProducts: number;
  maxStaff: number;
  maxDailyActivity: number;
}

export const PLANS: Record<BusinessPlanId, PlanLimits> = {
  free: {
    maxCategories: 5,
    maxProducts: 50,
    maxStaff: 1,
    maxDailyActivity: 10,
  },
  paid: {
    maxCategories: 500,
    maxProducts: 5000,
    maxStaff: 10,
    maxDailyActivity: 999_999,
  },
};

export const PAID_PLAN_PRICE_INR = 499;

export function getPlanLimits(plan: BusinessPlanId): PlanLimits {
  return PLANS[plan] ?? PLANS.free;
}

export function isPaidPlan(plan: string | null | undefined): boolean {
  return plan === "paid";
}

export function resolveBusinessPlan(value: string | null | undefined): BusinessPlanId {
  return value === "paid" ? "paid" : "free";
}
