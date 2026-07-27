import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    await prisma.adminNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to mark all as read" }, { status: 500 });
  }
}
