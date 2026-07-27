import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { deleteImage } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";

const ALLOWED_STATUSES = ["Draft", "Active", "Hidden", "Archived"];

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

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
    logError(e, "PRODUCT_HISTORY");
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    logError(err, "PRODUCT_FETCH");
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
      deletedImageIds,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const finalSlug = slug ? sanitizeSlug(slug) : sanitizeSlug(name);
    if (!finalSlug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const existingSlug = await prisma.product.findFirst({
      where: { slug: finalSlug, id: { not: id } },
    });
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already exists", field: "slug" }, { status: 409 });
    }

    const finalSku = sku?.trim() || "";
    if (finalSku) {
      const existingSku = await prisma.product.findFirst({
        where: { sku: finalSku, id: { not: id } },
      });
      if (existingSku) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    const cleanRegularPrice = String(regularPrice || "0.00 DH").trim();
    const parsedRegular = parseFloat(cleanRegularPrice.replace(/[^0-9.]/g, ""));
    if (isNaN(parsedRegular) || parsedRegular < 0) {
      return NextResponse.json({ error: "Invalid regular price" }, { status: 400 });
    }

    const cleanSalePrice = String(salePrice || "").trim() ? String(salePrice).trim() : "";
    const cleanCostPrice = String(costPrice || "").trim() ? String(costPrice).trim() : "";
    const finalStock = typeof stock === "number" ? Math.max(0, Math.floor(stock)) : 0;
    const finalLowStock = typeof lowStockThreshold === "number" ? Math.max(1, Math.floor(lowStockThreshold)) : 5;
    const finalStatus = ALLOWED_STATUSES.includes(status) ? status : "Draft";

    const changes: { field: string; oldValue: string; newValue: string }[] = [];

    if (existing.name !== name.trim()) {
      changes.push({ field: "name", oldValue: existing.name, newValue: name.trim() });
    }
    if (existing.slug !== finalSlug) {
      changes.push({ field: "slug", oldValue: existing.slug, newValue: finalSlug });
    }
    if (existing.price !== cleanRegularPrice) {
      changes.push({ field: "price", oldValue: existing.price, newValue: cleanRegularPrice });
    }
    if (existing.status !== finalStatus) {
      changes.push({ field: "status", oldValue: existing.status, newValue: finalStatus });
    }
    if (existing.stock !== finalStock) {
      changes.push({ field: "stock", oldValue: String(existing.stock), newValue: String(finalStock) });
    }
    if (existing.featured !== !!featured) {
      changes.push({ field: "featured", oldValue: String(existing.featured), newValue: String(!!featured) });
    }
    if (existing.isBestSeller !== !!isBestSeller) {
      changes.push({ field: "isBestSeller", oldValue: String(existing.isBestSeller), newValue: String(!!isBestSeller) });
    }

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

    // Handle image deletions
    if (Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
      const imagesToDelete = await prisma.productImage.findMany({
        where: { id: { in: deletedImageIds }, productId: id },
      });

      for (const img of imagesToDelete) {
        if (img.publicId) {
          try {
            await deleteImage(img.publicId);
          } catch { /* ignore delete errors */ }
        }
      }

      await prisma.productImage.deleteMany({
        where: { id: { in: deletedImageIds }, productId: id },
      });

      for (const imgId of deletedImageIds) {
        const removedImg = imagesToDelete.find((i) => i.id === imgId);
        await logHistory({
          productId: id,
          adminId: admin.id,
          adminName: admin.name,
          action: "Deleted Image",
          field: "image",
          oldValue: removedImg?.url || "",
          newValue: "",
        });
      }
    }

      // Handle image updates and additions
    if (Array.isArray(images)) {
      const existingImageIds = existing.images.map((i) => i.id);

      // Update existing images (sort order, cover)
      for (const img of images) {
        if (img.id && !img.id.startsWith("new-") && existingImageIds.includes(img.id)) {
          await prisma.productImage.update({
            where: { id: img.id },
            data: {
              sortOrder: img.sortOrder ?? 0,
              isCover: !!img.isCover,
              alt: img.alt ?? "",
            },
          });

          // Log cover change
          const existingImg = existing.images.find((i) => i.id === img.id);
          if (existingImg && existingImg.isCover !== !!img.isCover && img.isCover) {
            await logHistory({
              productId: id,
              adminId: admin.id,
              adminName: admin.name,
              action: "Cover Changed",
              field: "cover",
              oldValue: existingImg.url,
              newValue: img.url,
            });
          }
        } else if (!img.id || img.id.startsWith("new-")) {
          // New image
          const created = await prisma.productImage.create({
            data: {
              productId: id,
              url: img.url,
              alt: img.alt || "",
              sortOrder: img.sortOrder ?? 0,
              isCover: !!img.isCover,
              width: img.width || 0,
              height: img.height || 0,
              format: img.format || "",
              publicId: img.publicId || "",
              bytes: img.bytes || 0,
              imageHash: img.imageHash || "",
              blurDataURL: img.blurDataURL || "",
            },
          });
          await logHistory({
            productId: id,
            adminId: admin.id,
            adminName: admin.name,
            action: "Uploaded Image",
            field: "image",
            oldValue: "",
            newValue: created.url,
          });
        }
      }

      // Update cover and gallery on product
      const sortedImages = await prisma.productImage.findMany({
        where: { productId: id },
        orderBy: { sortOrder: "asc" },
      });
      const cover = sortedImages.find((i) => i.isCover) || sortedImages[0];
      const galleryUrls = sortedImages.map((i) => i.url);
      productData.image = cover?.url || "";
      productData.gallery = galleryUrls;
    }

    await prisma.product.update({
      where: { id },
      data: productData as Parameters<typeof prisma.product.update>[0]["data"],
    });

    // Log history for changes
    const actionMap: Record<string, string> = {
      price: "Price Changed",
      stock: "Stock Changed",
      status: "Status Changed",
    };

    for (const change of changes) {
      await logHistory({
        productId: id,
        adminId: admin.id,
        adminName: admin.name,
        action: actionMap[change.field] || "Edited",
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      });
    }

    if (changes.length === 0 && (!Array.isArray(images) || images.length === 0) && (!Array.isArray(deletedImageIds) || deletedImageIds.length === 0)) {
      await logHistory({
        productId: id,
        adminId: admin.id,
        adminName: admin.name,
        action: "Edited",
        field: "",
        oldValue: "",
        newValue: "",
      });
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({ product: updated });
  } catch (err) {
    logError(err, "PRODUCT_UPDATE");
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await params;

  try {
    // 1. Delete DB records atomically
    const imagesToDelete = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return [];

      // Collect images before cascade delete
      const imgs = await tx.productImage.findMany({ where: { productId: id }, select: { publicId: true } });

      // Nullify order items referencing this product
      await tx.orderItem.updateMany({
        where: { productId: id },
        data: { productId: null },
      });

      // Schema cascade handles: productVariant, productImage, productHistory
      await tx.product.delete({ where: { id } });
      return imgs;
    });

    // 2. Cleanup images after successful DB commit
    if (imagesToDelete.length > 0) {
      for (const img of imagesToDelete) {
        if (img.publicId) {
          try { await deleteImage(img.publicId); } catch { /* log but don't fail */ }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "PRODUCT_DELETE");
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
