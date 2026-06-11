import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { verifyPassword } from "@/lib/auth/password";
import { buildMerchantSession } from "@/lib/auth/merchant-session";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth/session";
import {
  enforceRateLimit,
  rejectUntrustedOrigin,
} from "@/lib/security/api-guard";
import { normalizePhone } from "@/lib/validation";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  let body: { phone?: string; password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const password = body.password ?? "";
  const remember = body.remember === true;

  if (!phone || !password) {
    return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
  }

  const rateBlock = enforceRateLimit(request, "auth-login", phone, 15, 15 * 60 * 1000);
  if (rateBlock) {
    return rateBlock;
  }

  const user = await repo.getUserByPhone(phone);
  if (!user?.password_hash) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Account temporarily locked. Try again later." },
      { status: 429 },
    );
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await repo.recordFailedMerchantLogin(user.id);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await repo.clearMerchantLoginFailures(user.id);
  const token = await buildMerchantSession(user.id, remember);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(remember));
  return response;
}
