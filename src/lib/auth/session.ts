import { SignJWT, jwtVerify } from "jose";
import type { AccountType } from "@/types/database";

export const SESSION_COOKIE_NAME = "elevo_session";
export const SETUP_COOKIE_NAME = "elevo_setup";
export const REMEMBER_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
export const SETUP_MAX_AGE_SECONDS = 10 * 60;

export interface SessionPayload {
  accountType: AccountType;
  userId?: string;
  staffId?: string;
  businessId: string | null;
  role: "admin" | "sales";
  isPlatformAdmin?: boolean;
  remember?: boolean;
}

export interface SetupPayload {
  phone: string;
  purpose: "merchant_setup" | "merchant_reset";
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set (min 32 characters) in .env.local");
  }
  return new TextEncoder().encode(secret);
}

export function sessionMaxAgeSeconds(remember = false): number {
  return remember ? REMEMBER_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
}

export async function createSessionToken(
  payload: SessionPayload,
  remember = false,
): Promise<string> {
  const maxAge = sessionMaxAgeSeconds(remember);
  return new SignJWT({ ...payload, remember })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSecret());
}

export async function createSetupToken(payload: SetupPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SETUP_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const accountType =
      payload.accountType === "staff" ? "staff" : ("merchant" as AccountType);

    if (accountType === "staff") {
      const staffId = payload.staffId;
      const businessId = payload.businessId;
      if (typeof staffId !== "string" || typeof businessId !== "string") {
        return null;
      }
      return {
        accountType: "staff",
        staffId,
        businessId,
        role: "sales",
        remember: payload.remember === true,
      };
    }

    const userId = payload.userId;
    if (typeof userId !== "string") return null;

    return {
      accountType: "merchant",
      userId,
      businessId:
        typeof payload.businessId === "string" ? payload.businessId : null,
      role: payload.role === "sales" ? "sales" : "admin",
      isPlatformAdmin: payload.isPlatformAdmin === true,
      remember: payload.remember === true,
    };
  } catch {
    return null;
  }
}

export async function verifySetupToken(token: string): Promise<SetupPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const phone = payload.phone;
    const purpose = payload.purpose;
    if (typeof phone !== "string") return null;
    if (purpose !== "merchant_setup" && purpose !== "merchant_reset") {
      return null;
    }
    return { phone, purpose };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(remember = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: sessionMaxAgeSeconds(remember),
    path: "/",
  };
}

export function setupCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SETUP_MAX_AGE_SECONDS,
    path: "/",
  };
}
