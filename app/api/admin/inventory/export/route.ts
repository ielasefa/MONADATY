import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { authGuard, errorResponse } from "@/lib/inventory-api";
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
      page: 1,
      pageSize: 10000,
    };

    const result = await queryInventoryAudit(params);

    const headers = ["ID", "Date", "ProductID", "VariantID", "Warehouse", "MovementType", "Quantity", "PreviousStock", "NewStock", "Reason", "Reference"];
    const csvRows = [headers.join(",")];

    for (const row of result.rows) {
      csvRows.push([
        row.id,
        row.date,
        row.productId,
        row.variantId || "",
        row.warehouse,
        row.movementType,
        row.quantity,
        row.previousStock,
        row.newStock,
        `"${(row.reason || "").replace(/"/g, '""')}"`,
        row.reference,
      ].join(","));
    }

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inventory-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    logError(err, "Failed to export audit data:");
    return errorResponse("Failed to export audit data", 500);
  }
}
