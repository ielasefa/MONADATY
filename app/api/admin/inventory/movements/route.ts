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
    const variantId = searchParams.get("variantId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!productId) {
      return errorResponse("productId is required");
    }

    const where: Prisma.InventoryMovementWhereInput = { productId };
    if (variantId) where.variantId = variantId;

    const [total, movements] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: {
          warehouse: { select: { name: true } },
        },
      }),
    ]);

    return successResponse({
      total,
      limit,
      offset,
      movements: movements.map((m) => ({
        id: m.id,
        productId: m.productId,
        variantId: m.variantId,
        warehouseName: m.warehouse.name,
        movementType: m.movementType,
        quantity: m.quantity,
        previousStock: m.previousStock,
        newStock: m.newStock,
        reason: m.reason,
        reference: m.reference,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logError(err, "Failed to fetch movements:");
    return errorResponse("Failed to fetch movements", 500);
  }
}
