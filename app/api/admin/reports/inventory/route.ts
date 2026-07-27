import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  try {
    const [totalProducts, totalStock, lowStockCount, outOfStockCount, movements] = await Promise.all([
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stock: true } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.inventoryMovement.findMany({
        where: { createdAt: { gte: from, lte: to } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      totalStock: totalStock._sum.stock ?? 0,
      lowStockCount,
      outOfStockCount,
      movementCount: movements.length,
      recentMovements: movements,
    });
  } catch (err) {
    logError(err, "Failed to get inventory report:");
    return NextResponse.json({ error: "Failed to get inventory report" }, { status: 500 });
  }
}
