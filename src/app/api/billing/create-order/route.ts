import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/cookies";
import * as repo from "@/lib/db/repo";
import { PAID_PLAN_PRICE_INR } from "@/lib/plans";
import { rejectUntrustedOrigin } from "@/lib/security/api-guard";

export async function POST(request: Request) {
  const originBlock = rejectUntrustedOrigin(request);
  if (originBlock) {
    return originBlock;
  }
  const session = await getSessionFromCookie();
  if (!session || session.accountType !== "merchant" || !session.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await repo.getBusinessById(session.businessId);
  const profile = session.userId ? await repo.getProfileById(session.userId) : null;
  if (!business || !profile) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const amountPaise = PAID_PLAN_PRICE_INR * 100;
  const orderId = `order_${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;

  await repo.insertSubscription({
    businessId: business.id,
    userPhone: profile.phone,
    razorpayOrderId: orderId,
    amountPaise,
    status: "pending",
  });

  if (!keyId || !keySecret) {
    return NextResponse.json({
      ok: true,
      devMode: true,
      message:
        "Razorpay keys not configured. Use Dev: activate paid on dashboard in development.",
      orderId,
    });
  }

  return NextResponse.json({
    ok: true,
    keyId,
    orderId,
    amount: amountPaise,
    currency: "INR",
    name: "Elevo",
    description: "Elevo paid plan (monthly)",
    prefill: { contact: profile.phone },
  });
}
