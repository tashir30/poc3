import "server-only";

import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth/session";

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getSessionFromRequest(
  request: Request,
): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!match) return null;
  const token = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
  return verifySessionToken(token);
}

export { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions };
