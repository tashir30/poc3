import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { devOtpMessage, storeOtpRequest } from "@/lib/auth/otp";
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

  let body: { phone?: string; purpose?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  const purpose = body.purpose === "reset" ? "reset" : "setup";

  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const rateBlock = enforceRateLimit(request, "auth-send-otp", phone, 5, 60 * 60 * 1000);
  if (rateBlock) {
    return rateBlock;
  }

  const user = await repo.getUserByPhone(phone);
  if (user?.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    return NextResponse.json(
      { error: "Account temporarily locked. Try again later." },
      { status: 429 },
    );
  }

  if (purpose === "setup" && user?.password_hash) {
    return NextResponse.json(
      { error: "Use your password to sign in." },
      { status: 403 },
    );
  }

  try {
    if (purpose === "reset") {
      if (user?.password_hash) {
        await storeOtpRequest(phone);
      }
    } else {
      await storeOtpRequest(phone);
    }

    return NextResponse.json({
      ok: true,
      message: devOtpMessage(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send OTP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
