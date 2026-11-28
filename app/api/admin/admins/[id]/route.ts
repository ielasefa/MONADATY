import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { AdminDeletionError, deleteAdminAccount } from "@/lib/admin-deletion";

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
    if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase();
    if (body.role !== undefined) {
      updateData.role = body.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
    }
    if (body.password) {
      if (body.password.length < 12) {
        return NextResponse.json({ error: "Password must be at least 12 characters" }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
      updateData.mustChangePassword = true;
      updateData.sessionToken = null;
    }

    const [admin] = await prisma.$transaction([
      prisma.admin.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, mustChangePassword: true, createdAt: true },
      }),
      ...(body.password ? [prisma.deviceSession.deleteMany({ where: { adminId: id } })] : []),
    ]);

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard) return guard;

  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;

  try {
    const { id } = await params;
    const actor = await getAuthenticatedAdmin();
    if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const deleted = await deleteAdminAccount(id, actor.id);
    await createAuditLog({ adminId: actor.id, adminName: actor.name, action: "delete", entity: "Admin", entityId: id, oldValue: JSON.stringify({ name: deleted.name, email: deleted.email, role: deleted.role }) });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AdminDeletionError) return NextResponse.json({ error: err.code }, { status: err.status });
    const errorInfo = err && typeof err === "object" ? err as { code?: unknown; meta?: Record<string, unknown>; name?: unknown } : {};
    const code = typeof errorInfo.code === "string" ? errorInfo.code : "";
    if (code === "P2025") return NextResponse.json({ error: "ADMIN_NOT_FOUND" }, { status: 404 });
    if (code === "P2034") return NextResponse.json({ error: "ADMIN_DELETE_CONFLICT" }, { status: 409 });
    if (code === "P2003") return NextResponse.json({ error: "ADMIN_HAS_HISTORY" }, { status: 409 });
    const meta = errorInfo.meta ?? {};
    logError(err, "Failed to delete admin", {
      code: code || undefined,
      errorName: typeof errorInfo.name === "string" ? errorInfo.name : undefined,
      model: typeof meta.modelName === "string" ? meta.modelName : undefined,
      field: typeof meta.field_name === "string" ? meta.field_name : undefined,
      constraint: typeof meta.constraint === "string" ? meta.constraint : undefined,
    });
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
