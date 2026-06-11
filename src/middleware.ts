import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/cookies";

const MERCHANT_APP_PREFIXES = [
  "/dashboard",
  "/products",
  "/categories",
  "/inventory",
  "/staff",
  "/activity",
  "/account",
  "/onboarding",
];

const STAFF_APP_PREFIXES = ["/inventory", "/activity"];

const ADMIN_ONLY_PREFIXES = [
  "/dashboard",
  "/products",
  "/categories",
  "/staff",
  "/account",
];

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const { pathname } = request.nextUrl;

  const isMerchantApp = MERCHANT_APP_PREFIXES.some((prefix) =>
    matchesRoutePrefix(pathname, prefix),
  );
  const isPlatform = matchesRoutePrefix(pathname, "/platform");
  const isStaffLogin = pathname === "/staff-login";
  const isLogin = pathname === "/login";

  if (isPlatform && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isPlatform && session?.accountType !== "merchant") {
    const url = request.nextUrl.clone();
    url.pathname = "/inventory";
    return NextResponse.redirect(url);
  }

  if (isPlatform && session && !session.isPlatformAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isMerchantApp && !session) {
    const url = request.nextUrl.clone();
    url.pathname = isStaffLogin ? "/staff-login" : "/login";
    return NextResponse.redirect(url);
  }

  if (session?.accountType === "staff") {
    const allowed = STAFF_APP_PREFIXES.some((prefix) =>
      matchesRoutePrefix(pathname, prefix),
    );
    if (isMerchantApp && !allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/inventory";
      return NextResponse.redirect(url);
    }
    if (isLogin || isStaffLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/inventory";
      return NextResponse.redirect(url);
    }
  }

  if (session?.accountType === "merchant") {
    if (isStaffLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isMerchantApp) {
      if (!session.businessId && pathname !== "/onboarding") {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (
        session.role === "sales" &&
        ADMIN_ONLY_PREFIXES.some((prefix) => matchesRoutePrefix(pathname, prefix))
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/inventory";
        return NextResponse.redirect(url);
      }
    }

    if (pathname === "/onboarding" && session.businessId) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
