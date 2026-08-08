import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { deleteImage } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";

const MIN_PRODUCT_NAME = 1;
const MAX_SLUG = 255;
const ALLOWED_STATUSES = ["Draft", "Active", "Hidden", "Archived"];

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG);
}

function generateSku(name: string): string {
  const prefix = name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
    .join("-");
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${suffix}`;
}

export async function POST(request: NextRequest) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      slug,
      shortDescription,
      description,
      sku,
      barcode,
      regularPrice,
      salePrice,
      costPrice,
      stock,
      lowStockThreshold,
      categoryId,
      collectionId,
      brand,
      status,
      featured,
      isBestSeller,
      images,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < MIN_PRODUCT_NAME) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const finalSlug = slug ? sanitizeSlug(slug) : sanitizeSlug(name);
    if (!finalSlug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists", field: "slug" }, { status: 409 });
    }

    const finalSku = sku?.trim() || generateSku(name);
    const existingSku = await prisma.product.findFirst({ where: { sku: finalSku } });
    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }

    const cleanRegularPrice = String(regularPrice || "0.00 DH").trim();
    const parsedRegular = parseFloat(cleanRegularPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedRegular) || parsedRegular < 0) {
      return NextResponse.json({ error: "Invalid regular price" }, { status: 400 });
    }

    const cleanSalePrice = String(salePrice || "").trim()
      ? String(salePrice).trim()
      : "";
    const cleanCostPrice = String(costPrice || "").trim()
      ? String(costPrice).trim()
      : "";
    const finalStock = typeof stock === "number" ? Math.max(0, Math.floor(stock)) : 0;
    const finalLowStock = typeof lowStockThreshold === "number" ? Math.max(1, Math.floor(lowStockThreshold)) : 5;
    const finalStatus = ALLOWED_STATUSES.includes(status) ? status : "Draft";

    const productData: Record<string, unknown> = {
      name: name.trim(),
      slug: finalSlug,
      shortDescription: shortDescription?.trim() || "",
      description: description?.trim() || "",
      sku: finalSku,
      barcode: barcode?.trim() || "",
      price: cleanRegularPrice,
      salePrice: cleanSalePrice,
      costPrice: cleanCostPrice,
      stock: finalStock,
      lowStockThreshold: finalLowStock,
      categoryId: categoryId || null,
      collectionId: collectionId || null,
      brand: brand?.trim() || "",
      status: finalStatus,
      available: finalStatus === "Active",
      featured: !!featured,
      isBestSeller: !!isBestSeller,
    };

    const product = await prisma.product.create({
      data: productData as Parameters<typeof prisma.product.create>[0]["data"],
    });

    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images.map((img: { url: string; alt?: string; sortOrder?: number; isCover?: boolean; width?: number; height?: number; format?: string; publicId?: string; bytes?: number; imageHash?: string; blurDataURL?: string }, idx: number) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || "",
        sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : idx,
        isCover: !!img.isCover,
        width: img.width || 0,
        height: img.height || 0,
        format: img.format || "",
        publicId: img.publicId || "",
        bytes: img.bytes || 0,
        imageHash: img.imageHash || "",
        blurDataURL: img.blurDataURL || "",
      }));

      await prisma.productImage.createMany({ data: imageRecords });

      const cover = imageRecords.find((i) => i.isCover) || imageRecords[0];
      const galleryUrls = imageRecords.map((i) => i.url);
      await prisma.product.update({
        where: { id: product.id },
        data: { image: cover.url, gallery: galleryUrls },
      });
    }

    const created = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    revalidateTag("landing");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/wishlist");

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    logError(err, "PRODUCT_CREATE");
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  let id: string | null = null;

  const { searchParams } = request.nextUrl;
  id = searchParams.get("id");

  if (!id) {
    try {
      const body = await request.json();
      id = body.id;
    } catch {}
  }

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const imagesToDelete = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return [];

      const imgs = await tx.productImage.findMany({ where: { productId: id }, select: { publicId: true } });

      await tx.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null },
      });

      await tx.product.delete({ where: { id } });
      return imgs;
    });

    if (imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        if (img.publicId) {
          try { await deleteImage(img.publicId); } catch {}
        }
      }
    }

    revalidateTag("landing");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/wishlist");

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "PRODUCT_DELETE");
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
