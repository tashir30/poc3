import "server-only";

import { cookies } from "next/headers";
import { getSessionFromCookie } from "@/lib/auth/cookies";
import { buildMerchantSession } from "@/lib/auth/merchant-session";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth/session";

export async function refreshSessionCookie(userId: string): Promise<void> {
  const existing = await getSessionFromCookie();
  const remember = existing?.remember === true;
  const token = await buildMerchantSession(userId, remember);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(remember));
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(), maxAge: 0 });
}
