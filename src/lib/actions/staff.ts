"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  generateStaffUsername,
  generateTempPassword,
  hashPassword,
} from "@/lib/auth/password";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireMerchantAdmin } from "@/lib/session";
import { buildWhatsAppUrl } from "@/lib/validation";
import { normalizePhone, sanitizeText } from "@/lib/validation";

export async function createStaffAccount(formData: FormData) {
  const { business } = await requireMerchantAdmin();
  const limits = getPlanLimits(business.plan);

  if ((await repo.countStaff(business.id)) >= limits.maxStaff) {
    return {
      error: `Your plan allows up to ${limits.maxStaff} active staff member(s). Upgrade to add more.`,
    };
  }

  const name = sanitizeText(formData.get("name")?.toString() ?? "", 120);
  const contactPhone = normalizePhone(formData.get("contact_phone")?.toString() ?? "");

  if (!name || !contactPhone) {
    return { error: "Name and contact phone are required" };
  }

  const tempPassword = generateTempPassword(10);
  const username = generateStaffUsername(business.slug);
  const passwordHash = await hashPassword(tempPassword);

  const staff = await repo.createStaffAccount({
    businessId: business.id,
    name,
    contactPhone,
    username,
    passwordHash,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const message = [
    `Your ${business.name} staff login for Elevo:`,
    `Username: ${staff.username}`,
    `Password: ${tempPassword}`,
    `Login: ${appUrl}/staff-login`,
  ].join("\n");

  revalidatePath("/staff");
  revalidatePath("/dashboard");

  return {
    ok: true,
    username: staff.username,
    whatsappUrl: buildWhatsAppUrl(contactPhone, message),
  };
}

export async function setStaffStatus(
  staffId: string,
  status: "active" | "inactive",
): Promise<void> {
  const { business } = await requireMerchantAdmin();
  if (!(await repo.updateStaffStatus(staffId, business.id, status))) {
    throw new Error("Staff member not found");
  }
  revalidatePath("/staff");
  revalidatePath("/dashboard");
}

export async function deleteStaffMember(staffId: string): Promise<void> {
  const { business } = await requireMerchantAdmin();
  if (!(await repo.deleteStaffAccount(staffId, business.id))) {
    throw new Error("Staff member not found");
  }
  revalidatePath("/staff");
  revalidatePath("/dashboard");
}

export async function resetStaffMemberPassword(staffId: string) {
  const { business } = await requireMerchantAdmin();
  const staff = await repo.getStaffById(staffId);
  if (!staff || staff.business_id !== business.id) {
    return { error: "Staff member not found" };
  }

  const tempPassword = generateTempPassword(10);
  const passwordHash = await hashPassword(tempPassword);
  await repo.resetStaffPassword(staffId, business.id, passwordHash);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const message = [
    `Your ${business.name} staff password was reset on Elevo:`,
    `Username: ${staff.username}`,
    `Password: ${tempPassword}`,
    `Login: ${appUrl}/staff-login`,
  ].join("\n");

  revalidatePath("/staff");

  return {
    ok: true,
    whatsappUrl: buildWhatsAppUrl(staff.contact_phone, message),
  };
}

export async function redirectToStaffPage() {
  redirect("/staff");
}
