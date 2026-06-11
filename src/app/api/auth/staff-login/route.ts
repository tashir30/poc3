import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { verifyPassword } from "@/lib/auth/password";
import { buildStaffSession } from "@/lib/auth/merchant-session";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth/session";
import {
  enforceRateLimit,
  rejectUntrustedOrigin,
} from "@/lib/security/api-guard";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = body.username?.trim().slice(0, 80) ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 },
    );
  }

  const rateBlock = enforceRateLimit(
    request,
    "auth-staff-login",
    username.toLowerCase(),
    15,
    15 * 60 * 1000,
  );
  if (rateBlock) {
    return rateBlock;
  }

  const staff = await repo.getStaffByUsername(username);
  if (!staff || staff.status !== "active") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (staff.locked_until && new Date(staff.locked_until).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Account temporarily locked. Try again later." },
      { status: 429 },
    );
  }

  const valid = await verifyPassword(password, staff.password_hash);
  if (!valid) {
    await repo.recordFailedStaffLogin(staff.id);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await repo.clearStaffLoginFailures(staff.id);
  const token = await buildStaffSession(staff.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(false));
  return response;
}
