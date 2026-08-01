import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

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
