import "server-only";

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

function getAllowedHost(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    return new URL(appUrl).host;
  } catch {
    return null;
  }
}

function urlMatchesApp(url: string, allowedHost: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.host === allowedHost &&
      (parsed.protocol === "http:" || parsed.protocol === "https:")
    );
  } catch {
    return false;
  }
}

export function rejectUntrustedOrigin(request: Request): NextResponse | null {
  if (process.env.ELEVO_SKIP_ORIGIN_CHECK === "true") {
    return null;
  }

  const allowedHost = getAllowedHost();
  if (!allowedHost) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (origin && urlMatchesApp(origin, allowedHost)) {
    return null;
  }
  if (referer && urlMatchesApp(referer, allowedHost)) {
    return null;
  }
  if (!origin && !referer && host === allowedHost) {
    return null;
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function enforceRateLimit(
  request: Request,
  scope: string,
  identifier: string,
  max: number,
  windowMs: number,
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${scope}:${ip}:${identifier}`;
  const result = checkRateLimit(key, max, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSec) },
      },
    );
  }

  return null;
}
