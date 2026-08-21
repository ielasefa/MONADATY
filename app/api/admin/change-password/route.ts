import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin, MUST_CHANGE_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limiter";
import { createAuditLog } from "@/lib/audit";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = rateLimit(`change-pw:${ip}`, 5, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 12) {
      return NextResponse.json({ error: "New password must be at least 12 characters" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const adminRecord = await prisma.admin.findUnique({ where: { id: admin.id } });
    if (!adminRecord) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, adminRecord.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    });

    createAuditLog({ adminId: admin.id, action: "password_change", entity: "Admin", entityId: admin.id, ip });

    const res = NextResponse.json({ success: true });
    res.cookies.set(MUST_CHANGE_COOKIE, "0", SESSION_COOKIE_OPTIONS);
    return res;
  } catch (e) {
    logError(e, "CHANGE_PASSWORD");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
