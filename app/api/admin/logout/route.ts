import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedAdmin, clearSessionDB, SESSION_COOKIE, MUST_CHANGE_COOKIE } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  try {
    const admin = await getAuthenticatedAdmin();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (admin) {
      createAuditLog({ adminId: admin.id, action: "logout", entity: "Admin", entityId: admin.id, ip });
    }

    // Clear session from DB using the cookie value
    const cookieStore = await cookies();
    const signed = cookieStore.get(SESSION_COOKIE)?.value;
    if (signed) {
      await clearSessionDB(signed);
    }

    const res = NextResponse.json({ success: true });
    res.cookies.delete(SESSION_COOKIE);
    res.cookies.delete(MUST_CHANGE_COOKIE);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');

    return res;
  } catch (e) {
    logError(e, "ADMIN_LOGOUT");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
