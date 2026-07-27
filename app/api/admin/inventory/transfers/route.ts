import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { transferStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const body = await request.json();
    const { productId, variantId, fromWarehouseId, toWarehouseId, quantity, reason } = body;

    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return errorResponse("productId, fromWarehouseId, toWarehouseId, and quantity are required");
    }

    const result = await transferStock({
      productId,
      variantId,
      fromWarehouseId,
      toWarehouseId,
      quantity,
      reason,
      adminId: admin.id,
    });

    return successResponse({ ...result }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transfer failed";
    logError(err, "Stock transfer failed:");
    return errorResponse(message, 500);
  }
}
