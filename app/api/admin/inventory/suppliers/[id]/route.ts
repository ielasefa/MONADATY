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

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return errorResponse("Supplier not found", 404);
    }

    return successResponse({ supplier });
  } catch (err) {
    logError(err, "Failed to fetch supplier:");
    return errorResponse("Failed to fetch supplier", 500);
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
    const { name, company, email, phone, address, website, taxNumber, contactPerson, notes, active } = body;

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse("Supplier not found", 404);
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        company: company ?? existing.company,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
        address: address ?? existing.address,
        website: website ?? existing.website,
        taxNumber: taxNumber ?? existing.taxNumber,
        contactPerson: contactPerson ?? existing.contactPerson,
        notes: notes ?? existing.notes,
        active: active ?? existing.active,
      },
    });

    return successResponse({ success: true, supplier });
  } catch (err) {
    logError(err, "Failed to update supplier:");
    return errorResponse("Failed to update supplier", 500);
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

    const poCount = await prisma.purchaseOrder.count({ where: { supplierId: id } });
    if (poCount > 0) {
      return errorResponse("Cannot delete supplier with existing purchase orders");
    }

    await prisma.supplier.delete({ where: { id } });

    return successResponse({ success: true });
  } catch (err) {
    logError(err, "Failed to delete supplier:");
    return errorResponse("Failed to delete supplier", 500);
  }
}
