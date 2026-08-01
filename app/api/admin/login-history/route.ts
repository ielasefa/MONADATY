import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { getAllLoginHistory, countLoginHistory } from "@/lib/login-history";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const [history, total] = await Promise.all([
      getAllLoginHistory(limit, offset),
      countLoginHistory(),
    ]);

    return NextResponse.json({ history, total });
  } catch (err) {
    logError(err, "Failed to handle login history:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    await prisma.loginHistory.update({
      where: { id },
      data: { suspicious: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "Failed to handle login history:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
