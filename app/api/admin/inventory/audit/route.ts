import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { queryInventoryAudit } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(request.url);

    const params = {
      warehouseId: searchParams.get("warehouseId") || undefined,
      productId: searchParams.get("productId") || undefined,
      variantId: searchParams.get("variantId") || undefined,
      movementType: searchParams.get("movementType") || undefined,
      adminId: searchParams.get("adminId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "50", 10),
    };

    const result = await queryInventoryAudit(params);

    return successResponse(result);
  } catch (err) {
    logError(err, "Failed to query audit log:");
    return errorResponse("Failed to query audit log", 500);
  }
}
