import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";

async function logHistory(params: {
  productId: string;
  adminId: string;
  adminName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}) {
  try {
    await prisma.productHistory.create({
      data: {
        productId: params.productId,
        adminId: params.adminId,
        adminName: params.adminName,
        action: params.action,
        field: params.field ?? "",
        oldValue: params.oldValue ?? "",
        newValue: params.newValue ?? "",
      },
    });
  } catch (e) {
    logError(e, "product history log error:");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, variantId } = await params;

  try {
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, size, price, salePrice, stock, sku, barcode, image, weight, sortOrder, status, isDefault } = body;

    // Check SKU uniqueness
    if (sku?.trim() && sku.trim() !== existing.sku) {
      const existingSku = await prisma.productVariant.findFirst({
        where: { sku: sku.trim(), productId: id, id: { not: variantId } },
      });
      if (existingSku) {
        return NextResponse.json({ error: "SKU already exists for another variant" }, { status: 409 });
      }
    }

    // If this is set as default, unset others
    if (isDefault && !existing.isDefault) {
      await prisma.productVariant.updateMany({
        where: { productId: id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        name: name?.trim() ?? existing.name,
        size: size?.trim() ?? existing.size,
        price: price?.trim() ?? existing.price,
        salePrice: salePrice?.trim() ?? existing.salePrice,
        stock: typeof stock === "number" ? Math.max(0, Math.floor(stock)) : existing.stock,
        sku: sku?.trim() ?? existing.sku,
        barcode: barcode?.trim() ?? existing.barcode,
        image: image?.trim() ?? existing.image,
        weight: weight?.trim() ?? existing.weight,
        sortOrder: typeof sortOrder === "number" ? sortOrder : existing.sortOrder,
        status: status || existing.status,
        isDefault: typeof isDefault === "boolean" ? isDefault : existing.isDefault,
      },
    });

    await logHistory({
      productId: id,
      adminId: admin.id,
      adminName: admin.name,
      action: "Variant Updated",
      field: "variant",
      oldValue: existing.name + (existing.size ? ` (${existing.size})` : ""),
      newValue: variant.name + (variant.size ? ` (${variant.size})` : ""),
    });

    return NextResponse.json({ variant });
  } catch (err) {
    logError(err, "Failed to update variant:");
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, variantId } = await params;

  try {
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.productVariant.delete({ where: { id: variantId } });

    await logHistory({
      productId: id,
      adminId: admin.id,
      adminName: admin.name,
      action: "Variant Deleted",
      field: "variant",
      oldValue: existing.name + (existing.size ? ` (${existing.size})` : ""),
      newValue: "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "Failed to delete variant:");
    return NextResponse.json({ error: "Failed to delete variant" }, { status: 500 });
  }
}
