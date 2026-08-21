import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> },
) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, variantId } = await params;

  try {
    const source = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });
    if (!source) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const maxSort = await prisma.productVariant.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        name: source.name ? `${source.name} Copy` : "Copy",
        size: source.size,
        price: source.price,
        salePrice: source.salePrice,
        stock: source.stock,
        sku: "",
        barcode: "",
        image: source.image,
        weight: source.weight,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
        status: source.status,
        isDefault: false,
      },
    });

    await prisma.productHistory.create({
      data: {
        productId: id,
        adminId: admin.id,
        adminName: admin.name,
        action: "Variant Duplicated",
        field: "variant",
        oldValue: source.name + (source.size ? ` (${source.size})` : ""),
        newValue: variant.name + (variant.size ? ` (${variant.size})` : ""),
      },
    }).catch((error) => logError(error, "product history log error:"));

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to duplicate variant:");
    return NextResponse.json({ error: "Failed to duplicate variant" }, { status: 500 });
  }
}
