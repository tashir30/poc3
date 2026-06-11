import "server-only";

import { randomInt } from "crypto";
import { OTP_TTL_MS } from "@/lib/constants";
import * as repo from "@/lib/db/repo";
import { hashCredential, verifyPassword } from "@/lib/auth/password";

export function isDevAuthMode(): boolean {
  if (process.env.ELEVO_DEV_AUTH === "true" && process.env.NODE_ENV === "production") {
    return false;
  }
  return (
    process.env.NODE_ENV === "development" &&
    process.env.ELEVO_DEV_AUTH === "true"
  );
}

function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function storeOtpRequest(phone: string): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  const otpCode = generateOtpCode();
  const otpHash = await hashCredential(otpCode);

  await repo.deleteOtpRequestsForPhone(phone);
  await repo.insertOtpRequest(phone, expiresAt, otpHash);

  if (isDevAuthMode()) {
    console.info(`[Elevo dev OTP] phone=${phone} code=${otpCode}`);
  } else if (!process.env.ELEVO_SMS_WEBHOOK_URL) {
    console.warn(
      `[Elevo] OTP generated for ${phone} but ELEVO_SMS_WEBHOOK_URL is not configured`,
    );
  }
}

export async function verifyOtpCode(phone: string, otp: string): Promise<boolean> {
  if (!/^\d{6}$/.test(otp)) {
    return false;
  }

  if (isDevAuthMode()) {
    return true;
  }

  const latest = await repo.getLatestOtpRequest(phone);
  if (!latest?.otp_hash) {
    return false;
  }
  if (new Date(latest.expires_at).getTime() < Date.now()) {
    return false;
  }

  const valid = await verifyPassword(otp, latest.otp_hash);
  if (valid) {
    await repo.deleteOtpRequestsForPhone(phone);
  }
  return valid;
}

export function devOtpMessage(): string {
  return isDevAuthMode()
    ? "Dev mode: check the server console for your OTP"
    : "If this number is eligible, an OTP was sent to your mobile";
}
