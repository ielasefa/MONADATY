import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (err) {
    logError(err, "Failed to fetch admin:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  const { id } = await params;

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) {
      updateData.role = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    }
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
      updateData.mustChangePassword = true;
      updateData.sessionToken = null;
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, mustChangePassword: true, createdAt: true },
    });

    const authed = await getAuthenticatedAdmin();
    if (authed) {
      createAuditLog({ adminId: authed.id, action: "update", entity: "Admin", entityId: id });
    }

    return NextResponse.json({ admin });
  } catch (e) {
    logError(e, "update admin error:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  try {
    const { id } = await params;

    const admin = await prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
    }

    await prisma.admin.delete({ where: { id } });

    const authed = await getAuthenticatedAdmin();
    if (authed) {
      createAuditLog({ adminId: authed.id, action: "delete", entity: "Admin", entityId: id });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "Failed to delete admin:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
