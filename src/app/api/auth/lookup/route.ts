import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
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

  let body: { phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const rateBlock = enforceRateLimit(request, "auth-lookup", phone, 20, 15 * 60 * 1000);
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

  return NextResponse.json({ ok: true });
}
