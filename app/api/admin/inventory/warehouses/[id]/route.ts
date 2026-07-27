import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { id } = await params;

    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (!warehouse) {
      return errorResponse("Warehouse not found", 404);
    }

    return successResponse({ warehouse });
  } catch (err) {
    logError(err, "Failed to fetch warehouse:");
    return errorResponse("Failed to fetch warehouse", 500);
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
    const { name, code, address, city, country, manager, phone, email, isDefault, isActive } = body;

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Warehouse not found", 404);
    }

    if (code && code !== existing.code) {
      const duplicate = await prisma.warehouse.findUnique({ where: { code } });
      if (duplicate) {
        return errorResponse("Warehouse code already in use");
      }
    }

    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        code: code ?? existing.code,
        address: address ?? existing.address,
        city: city ?? existing.city,
        country: country ?? existing.country,
        manager: manager ?? existing.manager,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        isDefault: isDefault ?? existing.isDefault,
        isActive: isActive ?? existing.isActive,
      },
    });

    return successResponse({ success: true, warehouse });
  } catch (err) {
    logError(err, "Failed to update warehouse:");
    return errorResponse("Failed to update warehouse", 500);
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

    const stockCount = await prisma.productWarehouseStock.count({ where: { warehouseId: id } });
    if (stockCount > 0) {
      return errorResponse("Cannot delete warehouse with existing stock records");
    }

    await prisma.warehouse.delete({ where: { id } });

    return successResponse({ success: true });
  } catch (err) {
    logError(err, "Failed to delete warehouse:");
    return errorResponse("Failed to delete warehouse", 500);
  }
}
