import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const originError = requireOrigin(req);
  if (originError) return originError;

  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.adminNotification.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.adminNotification.update({
      where: { id },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "POST /api/admin/notifications/read");
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
