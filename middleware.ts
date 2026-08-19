import { NextResponse, type NextRequest } from "next/server";
import { getSessionSecret } from "@/lib/env-validator";

const SESSION_COOKIE = "admin_session";
const MUST_CHANGE_COOKIE = "admin_must_change";

const SESSION_MAX_AGE = 60 * 60 * 24;

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

async function unsignToken(signed: string): Promise<string | null> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSessionSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  const expectedHex = Array.from(new Uint8Array(expected))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (sig.length !== expectedHex.length) return null;

  const sigBuf = new Uint8Array(sig.length);
  const expBuf = new Uint8Array(sig.length);
  for (let i = 0; i < sig.length; i++) {
    sigBuf[i] = sig.charCodeAt(i);
    expBuf[i] = expectedHex.charCodeAt(i);
  }

  let diff = 0;
  for (let i = 0; i < sigBuf.length; i++) {
    diff |= sigBuf[i] ^ expBuf[i];
  }

  return diff === 0 ? token : null;
}

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
      const token = await unsignToken(signed);
      if (token) {
        return NextResponse.redirect(
          new URL(mustChange ? "/admin/change-password" : "/admin/dashboard", request.url),
        );
      }
      const staleRes = NextResponse.next({ request: { headers: requestHeaders } });
      const delOpts = { ...SESSION_COOKIE_OPTIONS, maxAge: 0 };
      staleRes.cookies.set(SESSION_COOKIE, "", delOpts);
      staleRes.cookies.set(MUST_CHANGE_COOKIE, "", delOpts);
      staleRes.cookies.set("x-admin-pathname", "", { path: "/", maxAge: 0 });
      return staleRes;
    }
    return res;
  }

  if (!signed) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectRes = NextResponse.redirect(loginUrl);
    redirectRes.cookies.set("x-admin-pathname", "", { path: "/", maxAge: 0 });
    return redirectRes;
  }

  const token = await unsignToken(signed);
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
