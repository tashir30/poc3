import "server-only";

import * as repo from "@/lib/db/repo";
import {
  createSessionToken,
  type SessionPayload,
} from "@/lib/auth/session";

export async function buildMerchantSession(
  userId: string,
  remember = false,
): Promise<string> {
  const profile = await repo.getProfileById(userId);
  const user = await repo.getUserById(userId);
  const payload: SessionPayload = {
    accountType: "merchant",
    userId,
    businessId: profile?.business_id ?? null,
    role: profile?.role === "sales" ? "sales" : "admin",
    isPlatformAdmin: user?.is_platform_admin === true,
    remember,
  };

  return createSessionToken(payload, remember);
}

export async function buildStaffSession(staffId: string): Promise<string> {
  const staff = await repo.getStaffById(staffId);
  if (!staff || staff.status !== "active") {
    throw new Error("Staff account is not active");
  }

  const payload: SessionPayload = {
    accountType: "staff",
    staffId: staff.id,
    businessId: staff.business_id,
    role: "sales",
  };

  return createSessionToken(payload, false);
}
