import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { receivePurchaseOrder } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const { id } = await params;
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("items array is required with itemId and receivedQuantity");
    }

    const result = await receivePurchaseOrder(id, items, admin.id);

    return successResponse({ success: true, result }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to receive purchase order";
    logError(err, "Failed to receive purchase order:");
    return errorResponse(message, 500);
  }
}
