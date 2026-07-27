import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";
const MUST_CHANGE_COOKIE = "admin_must_change";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  throw new Error("SESSION_SECRET environment variable is required");
}

async function unsignToken(signed: string): Promise<string | null> {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSessionSecret());
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

  const expected = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  const expectedHex = Array.from(new Uint8Array(expected)).map((b) => b.toString(16).padStart(2, "0")).join("");

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

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);

  // Let the layout know the current pathname
  requestHeaders.set("x-admin-pathname", pathname);
  requestHeaders.set("x-admin-route", "1");

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Aggressive anti-cache headers for every admin page
  res.headers.set(
    "Cache-Control",
    "no-cache, no-store, max-age=0, must-revalidate, s-maxage=0, proxy-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");

  const signed = request.cookies.get(SESSION_COOKIE)?.value;

  // Login page: don't blindly redirect — the layout checks actual DB session validity
  if (pathname === "/admin/login") {
    return res;
  }

  // All other /admin/* pages require authentication
  if (!signed) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const token = await unsignToken(signed);
  if (!token) {
    const redirectRes = NextResponse.redirect(new URL("/admin/login", request.url));
    redirectRes.cookies.delete(SESSION_COOKIE);
    redirectRes.cookies.delete(MUST_CHANGE_COOKIE);
    return redirectRes;
  }

  // mustChangePassword redirect
  const mustChange = request.cookies.get(MUST_CHANGE_COOKIE)?.value === "1";
  if (mustChange && pathname !== "/admin/change-password") {
    return NextResponse.redirect(new URL("/admin/change-password", request.url));
  }

  // Allow API routes through after validation
  if (pathname.startsWith("/api/admin")) {
    return res;
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
