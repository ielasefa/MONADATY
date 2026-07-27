import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const warehouseId = searchParams.get("warehouseId");
    const variantId = searchParams.get("variantId");
    const lowStock = searchParams.get("lowStock");

    const where: Prisma.ProductWarehouseStockWhereInput = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (variantId) where.variantId = variantId;
    if (lowStock === "true") where.stock = { lte: 5 };

    const stockRecords = await prisma.productWarehouseStock.findMany({
      where,
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ warehouse: { name: "asc" } }, { productId: "asc" }],
    });

    return successResponse({ stockRecords });
  } catch (err) {
    logError(err, "Failed to fetch stock records:");
    return errorResponse("Failed to fetch stock records", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const body = await request.json();
    const { warehouseId, productId, variantId } = body;

    if (!warehouseId || !productId) {
      return errorResponse("warehouseId and productId are required");
    }

    const record = await prisma.productWarehouseStock.upsert({
      where: {
        warehouseId_productId_variantId: {
          warehouseId,
          productId,
          variantId: variantId || "",
        },
      },
      create: {
        warehouseId,
        productId,
        variantId: variantId || "",
        stock: 0,
        reservedStock: 0,
      },
      update: {},
      include: {
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });

    return successResponse({ success: true, stockRecord: record }, 201);
  } catch (err) {
    logError(err, "Failed to get/create stock record:");
    return errorResponse("Failed to get/create stock record", 500);
  }
}
