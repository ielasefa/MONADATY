import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { adjustStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const body = await request.json();
    const { productId, variantId, warehouseId, newStock, reason } = body;

    if (!productId || !warehouseId || newStock === undefined || !reason) {
      return errorResponse("productId, warehouseId, newStock, and reason are required");
    }

    const result = await adjustStock({
      productId,
      variantId,
      warehouseId,
      newStock,
      reason,
      adminId: admin.id,
    });

    return successResponse({ success: true, result }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Adjustment failed";
    logError(err, "Stock adjustment failed:");
    return errorResponse(message, 500);
  }
}
