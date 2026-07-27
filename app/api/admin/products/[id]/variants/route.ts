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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, size, price, salePrice, stock, sku, barcode, image, weight, status, isDefault } = body;

    // Get max sort order
    const maxSort = await prisma.productVariant.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const sortOrder = (maxSort?.sortOrder ?? -1) + 1;

    // Check SKU uniqueness
    if (sku?.trim()) {
      const existingSku = await prisma.productVariant.findFirst({
        where: { sku: sku.trim(), productId: id },
      });
      if (existingSku) {
        return NextResponse.json({ error: "Variant SKU already exists for this product" }, { status: 409 });
      }
    }

    // If this is set as default, unset others
    if (isDefault) {
      await prisma.productVariant.updateMany({
        where: { productId: id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        name: name?.trim() || "",
        size: size?.trim() || "",
        price: price?.trim() || "0.00 DH",
        salePrice: salePrice?.trim() || "",
        stock: typeof stock === "number" ? Math.max(0, Math.floor(stock)) : 0,
        sku: sku?.trim() || "",
        barcode: barcode?.trim() || "",
        image: image?.trim() || "",
        weight: weight?.trim() || "",
        sortOrder,
        status: status || "Active",
        isDefault: !!isDefault,
      },
    });

    await logHistory({
      productId: id,
      adminId: admin.id,
      adminName: admin.name,
      action: "Variant Added",
      field: "variant",
      oldValue: "",
      newValue: `${name}${size ? ` (${size})` : ""}`,
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (err) {
    logError(err, "Failed to create variant:");
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { variants } = body;

    if (!Array.isArray(variants)) {
      return NextResponse.json({ error: "variants array required" }, { status: 400 });
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (v.id) {
        // Check SKU uniqueness
        if (v.sku?.trim()) {
          const existingSku = await prisma.productVariant.findFirst({
            where: { sku: v.sku.trim(), productId: id, id: { not: v.id } },
          });
          if (existingSku) {
            return NextResponse.json({ error: `SKU "${v.sku}" already exists for another variant` }, { status: 409 });
          }
        }

        await prisma.productVariant.update({
          where: { id: v.id },
          data: {
            name: v.name?.trim() ?? "",
            size: v.size?.trim() ?? "",
            price: v.price?.trim() ?? "0.00 DH",
            salePrice: v.salePrice?.trim() ?? "",
            stock: typeof v.stock === "number" ? Math.max(0, Math.floor(v.stock)) : 0,
            sku: v.sku?.trim() ?? "",
            barcode: v.barcode?.trim() ?? "",
            image: v.image?.trim() ?? "",
            weight: v.weight?.trim() ?? "",
            sortOrder: typeof v.sortOrder === "number" ? v.sortOrder : i,
            status: v.status || "Active",
            isDefault: !!v.isDefault,
          },
        });
      }
    }

    // If default was set, ensure only one
    const hasDefault = variants.some((v: { isDefault?: boolean }) => v.isDefault);
    if (hasDefault) {
      const defaultVariant = variants.find((v: { isDefault?: boolean }) => v.isDefault);
      if (defaultVariant?.id) {
        await prisma.productVariant.updateMany({
          where: { productId: id, isDefault: true, id: { not: defaultVariant.id } },
          data: { isDefault: false },
        });
      }
    }

    const updatedVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ variants: updatedVariants });
  } catch (err) {
    logError(err, "Failed to update variants:");
    return NextResponse.json({ error: "Failed to update variants" }, { status: 500 });
  }
}
