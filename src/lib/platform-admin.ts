import "server-only";

import { normalizePhone } from "@/lib/validation";

export function getPlatformAdminPhones(): Set<string> {
  const raw = process.env.ELEVO_PLATFORM_ADMIN_PHONES ?? "";
  const phones = raw
    .split(",")
    .map((value) => normalizePhone(value.trim()))
    .filter((value): value is string => value !== null && value.length > 0);
  return new Set(phones);
}

export function isPlatformAdminPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  if (!normalized) {
    return false;
  }
  return getPlatformAdminPhones().has(normalized);
}
