import "server-only";

import { cache } from "react";
import * as repo from "@/lib/db/repo";
import { getSessionFromCookie } from "@/lib/auth/cookies";
import type { Business, Profile } from "@/types/database";
import { redirect } from "next/navigation";

export const getSessionContext = cache(async () => {
  const session = await getSessionFromCookie();

  if (!session) {
    return {
      session: null,
      user: null,
      profile: null,
      staff: null,
      business: null,
    };
  }

  if (session.accountType === "staff") {
    const [staff, business] = await Promise.all([
      session.staffId ? repo.getStaffById(session.staffId) : Promise.resolve(null),
      session.businessId
        ? repo.getBusinessById(session.businessId)
        : Promise.resolve(null),
    ]);

    return {
      session,
      user: null,
      profile: null,
      staff,
      business: staff?.status === "active" ? business : null,
    };
  }

  const [profile, businessFromSession] = await Promise.all([
    session.userId ? repo.getProfileById(session.userId) : Promise.resolve(null),
    session.businessId
      ? repo.getBusinessById(session.businessId)
      : Promise.resolve(null),
  ]);

  let business = businessFromSession;
  if (!business && profile?.business_id) {
    business = await repo.getBusinessById(profile.business_id);
  }

  return {
    session,
    user: session.userId ? { id: session.userId } : null,
    profile: profile as Profile | null,
    staff: null,
    business: business as Business | null,
  };
});

export async function requireBusinessContext() {
  const ctx = await getSessionContext();
  if (!ctx.session) redirect("/login");
  if (!ctx.business) redirect("/onboarding");

  if (ctx.session.accountType === "staff") {
    if (!ctx.staff || ctx.staff.status !== "active") {
      redirect("/staff-login");
    }
    const syntheticProfile: Profile = {
      id: ctx.staff.id,
      phone: ctx.staff.contact_phone,
      name: ctx.staff.name,
      role: "sales",
      business_id: ctx.business.id,
      created_at: ctx.staff.created_at,
    };
    return {
      session: ctx.session,
      user: { id: ctx.staff.id },
      profile: syntheticProfile,
      staff: ctx.staff,
      business: ctx.business,
    };
  }

  if (!ctx.profile) redirect("/onboarding");

  return {
    session: ctx.session,
    user: ctx.user!,
    profile: ctx.profile,
    staff: null,
    business: ctx.business,
  };
}

export async function requireMerchantAdmin() {
  const ctx = await requireBusinessContext();
  if (ctx.session.accountType !== "merchant" || ctx.profile.role !== "admin") {
    redirect("/inventory");
  }
  return ctx;
}

export async function requirePlatformAdmin() {
  const ctx = await getSessionContext();
  if (!ctx.session || ctx.session.accountType !== "merchant") {
    redirect("/login");
  }
  const user = ctx.session.userId ? await repo.getUserById(ctx.session.userId) : null;
  if (!user?.is_platform_admin) {
    redirect("/dashboard");
  }
  return ctx;
}
