import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { getAdminPermissions, setAdminPermissions } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const permissions = await getAdminPermissions(admin.id);

    return successResponse({ permissions });
  } catch (err) {
    logError(err, "Failed to fetch permissions:");
    return errorResponse("Failed to fetch permissions", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    if (admin.role !== "SUPER_ADMIN") {
      return errorResponse("Only SUPER_ADMIN can update permissions", 403);
    }

    const body = await request.json();
    const { inventory, warehouse, purchasing } = body;

    if (inventory === undefined && warehouse === undefined && purchasing === undefined) {
      return errorResponse("At least one permission field is required");
    }

    const result = await setAdminPermissions(admin.id, {
      inventory,
      warehouse,
      purchasing,
    });

    return successResponse({ success: true, permissions: result });
  } catch (err) {
    logError(err, "Failed to update permissions:");
    return errorResponse("Failed to update permissions", 500);
  }
}
