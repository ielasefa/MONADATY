import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { adjustStock, transferStock } from "@/lib/inventory";

export const dynamic = "force-dynamic";

type BulkItem = {
  productId: string;
  variantId?: string;
  warehouseId?: string;
  quantity?: number;
  newStock?: number;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  reason?: string;
};

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;
    const { admin } = guard;

    const body = await request.json();
    const { action, items } = body as { action: string; items: BulkItem[] };

    if (!action || !Array.isArray(items) || items.length === 0) {
      return errorResponse("action and items array are required");
    }

    const results: { index: number; success: boolean; error?: string }[] = [];

    if (action === "adjust") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (!item.productId || !item.warehouseId || item.newStock === undefined) {
            throw new Error("productId, warehouseId, and newStock are required");
          }
          await adjustStock({
            productId: item.productId,
            variantId: item.variantId,
            warehouseId: item.warehouseId,
            newStock: item.newStock,
            reason: item.reason || "Bulk adjustment",
            adminId: admin.id,
          });
          results.push({ index: i, success: true });
        } catch (err) {
          results.push({ index: i, success: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }
    } else if (action === "transfer") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (!item.productId || !item.fromWarehouseId || !item.toWarehouseId || !item.quantity) {
            throw new Error("productId, fromWarehouseId, toWarehouseId, and quantity are required");
          }
          await transferStock({
            productId: item.productId,
            variantId: item.variantId,
            fromWarehouseId: item.fromWarehouseId,
            toWarehouseId: item.toWarehouseId,
            quantity: item.quantity,
            reason: item.reason || "Bulk transfer",
            adminId: admin.id,
          });
          results.push({ index: i, success: true });
        } catch (err) {
          results.push({ index: i, success: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }
    } else if (action === "delete") {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          if (!item.productId) {
            throw new Error("productId is required");
          }
          const where: Prisma.ProductWarehouseStockWhereInput = { productId: item.productId };
          if (item.warehouseId) where.warehouseId = item.warehouseId;
          if (item.variantId) where.variantId = item.variantId;

          await prisma.productWarehouseStock.deleteMany({ where });
          results.push({ index: i, success: true });
        } catch (err) {
          results.push({ index: i, success: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }
    } else {
      return errorResponse(`Unknown action: ${action}. Supported: adjust, transfer, delete`);
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return successResponse({
      success: failCount === 0,
      total: items.length,
      successCount,
      failCount,
      results,
    });
  } catch (err) {
    logError(err, "Bulk operation failed:");
    return errorResponse("Bulk operation failed", 500);
  }
}
