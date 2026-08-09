"use server";

import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import {
  createSessionDB,
  MUST_CHANGE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  validateCredentials,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";
import { createAuditLog } from "@/lib/audit";
import { logError } from "@/lib/logger";

type LoginInput = {
  email: unknown;
  password: unknown;
  redirectTo?: string | null;
};

type LoginError = { error: string };

export async function loginAdmin(input: LoginInput): Promise<LoginError> {
  let destination = "/admin/dashboard";

  try {
    const { email, password, redirectTo } = input;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return { error: "Invalid input format" };
    }

    if (!email.includes("@") || !email.includes(".")) {
      return { error: "Invalid email format" };
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateKey = `login:${email}:${ip}`;
    const rateCheck = checkRateLimit(rateKey, 10, 60_000);

    if (!rateCheck.allowed) {
      const retryAfter = Math.ceil((rateCheck.resetAt - Date.now()) / 1000);
      return { error: `Too many attempts. Retry after ${retryAfter} seconds.` };
    }

    const admin = await validateCredentials(email, password);
    if (!admin) {
      return { error: "Invalid credentials" };
    }

    const signed = await createSessionDB(admin);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, signed, SESSION_COOKIE_OPTIONS);
    cookieStore.set(
      MUST_CHANGE_COOKIE,
      admin.mustChangePassword ? "1" : "0",
      SESSION_COOKIE_OPTIONS,
    );

    void createAuditLog({
      adminId: admin.id,
      action: "login",
      entity: "Admin",
      entityId: admin.id,
      ip,
    });

    destination = admin.mustChangePassword
      ? "/admin/change-password"
      : redirectTo && redirectTo.startsWith("/admin/")
        ? redirectTo
        : "/admin/dashboard";
  } catch (error) {
    logError(error, "ADMIN_LOGIN");
    return { error: "Internal server error" };
  }

  redirect(destination, RedirectType.replace);
}
