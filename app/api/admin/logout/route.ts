import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAuthenticatedAdmin,
  clearSessionDB,
  SESSION_COOKIE,
  MUST_CHANGE_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";
import { logError } from "@/lib/logger";
import { recordLogout } from "@/lib/login-history";

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  const res = NextResponse.json({ success: true });
  const expireOpts = { ...SESSION_COOKIE_OPTIONS, maxAge: 0 };
  res.cookies.set(SESSION_COOKIE, "", expireOpts);
  res.cookies.set(MUST_CHANGE_COOKIE, "", expireOpts);
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");

  try {
    const admin = await getAuthenticatedAdmin();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (admin) {
      createAuditLog({ adminId: admin.id, action: "logout", entity: "Admin", entityId: admin.id, ip });
      await recordLogout(admin.id);
    }

    // Clear session from DB using the cookie value
    const cookieStore = await cookies();
    const signed = cookieStore.get(SESSION_COOKIE)?.value;
    if (signed) {
      await clearSessionDB(signed);
    }

    return res;
  } catch (e) {
    logError(e, "ADMIN_LOGOUT");
    const failed = NextResponse.json({ error: "Session revocation failed" }, { status: 503 });
    failed.cookies.set(SESSION_COOKIE, "", expireOpts);
    failed.cookies.set(MUST_CHANGE_COOKIE, "", expireOpts);
    failed.headers.set("Cache-Control", "no-store");
    return failed;
  }
}
