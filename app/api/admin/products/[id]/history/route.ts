import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;

    const history = await prisma.productHistory.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ history });
  } catch (err) {
    logError(err, "Failed to fetch history:");
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
