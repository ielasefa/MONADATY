import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { getInventoryDashboard } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const dashboard = await getInventoryDashboard();

    return successResponse({ dashboard });
  } catch (err) {
    logError(err, "Failed to fetch dashboard:");
    return errorResponse("Failed to fetch dashboard", 500);
  }
}
