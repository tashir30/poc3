import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { verifyOtpCode } from "@/lib/auth/otp";
import {
  createSetupToken,
  SETUP_COOKIE_NAME,
  setupCookieOptions,
} from "@/lib/auth/session";
import {
  enforceRateLimit,
  rejectUntrustedOrigin,
} from "@/lib/security/api-guard";
import { isValidOtp, normalizePhone } from "@/lib/validation";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }

  let body: { phone?: string; otp?: string; purpose?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const otp = body.otp ?? "";
  const purpose = body.purpose === "reset" ? "reset" : "setup";

  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  if (!isValidOtp(otp)) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  const rateBlock = enforceRateLimit(request, "auth-verify-otp", phone, 10, 15 * 60 * 1000);
  if (rateBlock) {
    return rateBlock;
  }

  const user = await repo.getUserByPhone(phone);

  if (purpose === "setup" && user?.password_hash) {
    return NextResponse.json(
      { error: "Use your password to sign in." },
      { status: 403 },
    );
  }

  if (purpose === "reset" && !user?.password_hash) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  const valid = await verifyOtpCode(phone, otp);
  if (!valid) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  const setupToken = await createSetupToken({
    phone,
    purpose: purpose === "reset" ? "merchant_reset" : "merchant_setup",
  });
  const response = NextResponse.json({
    ok: true,
    needsPassword: true,
    purpose,
  });
  response.cookies.set(SETUP_COOKIE_NAME, setupToken, setupCookieOptions());
  return response;
}
