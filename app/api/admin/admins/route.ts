import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ admins });
  } catch (err) {
    logError(err, "Failed to fetch admins:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const adminRole = role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";

    const admin = await prisma.admin.create({
      data: { name, email, passwordHash, role: adminRole, mustChangePassword: true },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const authed = await getAuthenticatedAdmin();
    if (authed) {
      createAuditLog({ adminId: authed.id, action: "create", entity: "Admin", entityId: admin.id });
    }

    return NextResponse.json({ admin }, { status: 201 });
  } catch (e) {
    logError(e, "create admin error:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
