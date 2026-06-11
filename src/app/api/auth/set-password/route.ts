import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as repo from "@/lib/db/repo";
import { hashPassword, validatePassword } from "@/lib/auth/password";
import { buildMerchantSession } from "@/lib/auth/merchant-session";
import {
  SETUP_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  setupCookieOptions,
  sessionCookieOptions,
  verifySetupToken,
} from "@/lib/auth/session";
import { rejectUntrustedOrigin } from "@/lib/security/api-guard";
import { normalizePhone } from "@/lib/validation";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }
  let body: { password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  const remember = body.remember === true;
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const cookieStore = await cookies();
  const setupToken = cookieStore.get(SETUP_COOKIE_NAME)?.value;
  if (!setupToken) {
    return NextResponse.json({ error: "Setup session expired" }, { status: 401 });
  }

  const setup = await verifySetupToken(setupToken);
  if (!setup) {
    return NextResponse.json({ error: "Setup session expired" }, { status: 401 });
  }

  const phone = normalizePhone(setup.phone);
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const userId = await repo.ensureUser(phone);
  await repo.ensureProfile(userId, phone, "admin");
  const passwordHash = await hashPassword(password);
  await repo.setUserPassword(userId, passwordHash, false);
  await repo.clearMerchantLoginFailures(userId);

  const profile = await repo.getProfileById(userId);
  const redirectTo =
    setup.purpose === "merchant_reset"
      ? profile?.business_id
        ? "dashboard"
        : "onboarding"
      : "onboarding";

  const token = await buildMerchantSession(userId, remember);
  const response = NextResponse.json({ ok: true, redirect: redirectTo });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(remember));
  response.cookies.set(SETUP_COOKIE_NAME, "", { ...setupCookieOptions(), maxAge: 0 });
  return response;
}
