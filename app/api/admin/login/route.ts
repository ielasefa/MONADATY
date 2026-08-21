import { NextResponse } from "next/server";
import { validateCredentials, createSessionDB, SESSION_COOKIE, MUST_CHANGE_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { requireOrigin } from "@/lib/csrf";
import { createAuditLog } from "@/lib/audit";
import { logError } from "@/lib/logger";
import { createDeviceSession } from "@/lib/device-sessions";
import { verifySessionToken } from "@/lib/session-token";
import { recordLogin } from "@/lib/login-history";

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const normalizedEmail = email.trim().toLowerCase();
    const rateKey = `login:${normalizedEmail}:${ip}`;
    const rateCheck = checkRateLimit(rateKey, 10, 60_000);

    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Retry after ${retryAfter} seconds.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const admin = await validateCredentials(normalizedEmail, password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const signed = await createSessionDB(admin);
    const verified = await verifySessionToken(signed);
    if (verified) {
      try {
        await createDeviceSession({
          adminId: admin.id,
          token: verified.sessionId,
          ip,
          userAgent: request.headers.get("user-agent") ?? "Unknown",
        });
      } catch (error) {
        logError(error, "DEVICE_SESSION_CREATE");
      }
    }
    await recordLogin({
      adminId: admin.id,
      ip,
      userAgent: request.headers.get("user-agent") ?? "Unknown",
      success: true,
    });

    const res = NextResponse.json({ success: true, mustChangePassword: admin.mustChangePassword });
    res.cookies.set(SESSION_COOKIE, signed, SESSION_COOKIE_OPTIONS);
    res.cookies.set(MUST_CHANGE_COOKIE, admin.mustChangePassword ? "1" : "0", SESSION_COOKIE_OPTIONS);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    createAuditLog({ adminId: admin.id, action: "login", entity: "Admin", entityId: admin.id, ip });
    return res;
  } catch (e) {
    logError(e, "ADMIN_LOGIN");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
