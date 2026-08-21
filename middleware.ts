import { NextResponse, type NextRequest } from "next/server";
import {
  MUST_CHANGE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  verifySessionToken,
} from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-pathname", pathname);
  requestHeaders.set("x-admin-route", "1");

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  res.headers.set(
    "Cache-Control",
    "no-cache, no-store, max-age=0, must-revalidate, s-maxage=0, proxy-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");

  // Admin API routes: apply anti-cache headers only. Individual route handlers verify
  // auth (return 401 JSON). CRITICAL: never redirect API requests to the login page —
  // redirects corrupt JSON clients and surface as spurious "Unauthorized" errors.
  if (pathname.startsWith("/api/admin")) {
    return res;
  }

  const signed = request.cookies.get(SESSION_COOKIE)?.value;
  const mustChange = request.cookies.get(MUST_CHANGE_COOKIE)?.value === "1";

  if (pathname === "/admin/login") {
    if (signed) {
      const token = await verifySessionToken(signed);
      if (!token) {
        const staleRes = NextResponse.next({ request: { headers: requestHeaders } });
        const delOpts = { ...SESSION_COOKIE_OPTIONS, maxAge: 0 };
        staleRes.cookies.set(SESSION_COOKIE, "", delOpts);
        staleRes.cookies.set(MUST_CHANGE_COOKIE, "", delOpts);
        return staleRes;
      }
    }
    // The middleware cannot verify DB revocation. Always permit the login page;
    // a current session may simply authenticate again, and a revoked token cannot loop.
    return res;
  }

  if (!signed) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.set("x-admin-pathname", "", { path: "/", maxAge: 0 });
    return redirectRes;
  }

  const token = await verifySessionToken(signed);
  if (!token) {
    const redirectRes = NextResponse.redirect(new URL("/admin/login", request.url));
    const delOpts = { ...SESSION_COOKIE_OPTIONS, maxAge: 0 };
    redirectRes.cookies.set(SESSION_COOKIE, "", delOpts);
    redirectRes.cookies.set(MUST_CHANGE_COOKIE, "", delOpts);
    redirectRes.cookies.set("x-admin-pathname", "", { path: "/", maxAge: 0 });
    return redirectRes;
  }

  if (mustChange && pathname !== "/admin/change-password") {
    const redirectRes = NextResponse.redirect(
      new URL("/admin/change-password", request.url),
    );
    redirectRes.cookies.set("x-admin-pathname", "", { path: "/", maxAge: 0 });
    return redirectRes;
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
