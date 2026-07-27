import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { createPurchaseOrder } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          supplier: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true } },
        },
      }),
    ]);

    return successResponse({
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      purchaseOrders,
    });
  } catch (err) {
    logError(err, "Failed to fetch purchase orders:");
    return errorResponse("Failed to fetch purchase orders", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const body = await request.json();
    const { supplierId, warehouseId, items, notes } = body;

    if (!supplierId || !warehouseId || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("supplierId, warehouseId, and items are required");
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.cost) {
        return errorResponse("Each item must have productId, quantity, and cost");
      }
    }

    const result = await createPurchaseOrder({
      supplierId,
      warehouseId,
      items,
      notes,
      adminId: admin.id,
    });

    return successResponse({ success: true, purchaseOrder: result.purchaseOrder }, 201);
  } catch (err) {
    logError(err, "Failed to create purchase order:");
    return errorResponse("Failed to create purchase order", 500);
  }
}
