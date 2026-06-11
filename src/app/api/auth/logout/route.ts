import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SETUP_COOKIE_NAME,
  sessionCookieOptions,
  setupCookieOptions,
} from "@/lib/auth/session";
import { rejectUntrustedOrigin } from "@/lib/security/api-guard";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(SETUP_COOKIE_NAME, "", {
    ...setupCookieOptions(),
    maxAge: 0,
  });
  return response;
}
