import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";
import { POStatus } from "@/lib/inventory";

const VALID_STATUSES: POStatus[] = ["Draft", "Pending", "Approved", "Ordered", "Received", "Cancelled"];

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, name: true, company: true } },
        warehouse: { select: { id: true, name: true, code: true } },
        items: true,
      },
    });

    if (!purchaseOrder) {
      return errorResponse("Purchase order not found", 404);
    }

    return successResponse({ purchaseOrder });
  } catch (err) {
    logError(err, "Failed to fetch purchase order:");
    return errorResponse("Failed to fetch purchase order", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return errorResponse("Status is required");
    }

    if (!VALID_STATUSES.includes(status)) {
      return errorResponse(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Purchase order not found", 404);
    }

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    return successResponse({ success: true, purchaseOrder });
  } catch (err) {
    logError(err, "Failed to update purchase order:");
    return errorResponse("Failed to update purchase order", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const existing = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Purchase order not found", 404);
    }

    if (existing.status !== "Draft") {
      return errorResponse("Only draft purchase orders can be deleted");
    }

    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    await prisma.purchaseOrder.delete({ where: { id } });

    return successResponse({ success: true });
  } catch (err) {
    logError(err, "Failed to delete purchase order:");
    return errorResponse("Failed to delete purchase order", 500);
  }
}
