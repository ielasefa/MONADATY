import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { deleteImage } from "@/lib/cloudinary";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, productIds, value } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No products selected" }, { status: 400 });
    }

    switch (action) {
      case "delete": {
        // 1. Delete DB records atomically
        const imagesToDelete = await prisma.$transaction(async (tx) => {
          const imgs = await tx.productImage.findMany({
            where: { productId: { in: productIds } },
            select: { publicId: true },
          });

          await tx.orderItem.updateMany({
            where: { productId: { in: productIds } },
            data: { productId: null },
          });

          await tx.product.deleteMany({ where: { id: { in: productIds } } });
          return imgs;
        });

        // 2. Cleanup images after successful DB commit
        for (const img of imagesToDelete) {
          if (img.publicId) {
            try { await deleteImage(img.publicId); } catch { /* log but don't fail */ }
          }
        }
        break;
      }

      case "archive":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "Archived", available: false },
        });
        break;

      case "activate":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "Active", available: true },
        });
        break;

      case "hide":
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: "Hidden", available: false },
        });
        break;

      case "changeCategory":
        if (!value) {
          return NextResponse.json({ error: "Category ID required" }, { status: 400 });
        }
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: value },
        });
        break;

      case "changeCollection":
        if (!value) {
          return NextResponse.json({ error: "Collection ID required" }, { status: 400 });
        }
        await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { collectionId: value },
        });
        break;

      case "duplicate": {
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            images: true,
            variants: true,
          },
        });

        const created: string[] = [];
        for (const product of products) {
          const newSlug = await generateUniqueSlug(product.slug);
          const newSku = product.sku ? `${product.sku}-COPY` : "";

          const newProduct = await prisma.product.create({
            data: {
              name: product.name,
              slug: newSlug,
              shortDescription: product.shortDescription,
              description: product.description,
              sku: newSku,
              barcode: "",
              price: product.price,
              salePrice: product.salePrice,
              costPrice: product.costPrice,
              stock: product.stock,
              lowStockThreshold: product.lowStockThreshold,
              categoryId: product.categoryId,
              collectionId: product.collectionId,
              brand: product.brand,
              status: "Draft",
              available: false,
              featured: false,
              isBestSeller: false,
            },
          });

          // Copy images
          if (product.images.length > 0) {
            const imageRecords = product.images.map((img, idx) => ({
              productId: newProduct.id,
              url: img.url,
              alt: img.alt,
              sortOrder: idx,
              isCover: img.isCover,
              width: img.width,
              height: img.height,
              format: img.format,
              publicId: img.publicId,
              bytes: img.bytes,
            }));

            await prisma.productImage.createMany({ data: imageRecords });

            const cover = imageRecords.find((i) => i.isCover) || imageRecords[0];
            const galleryUrls = imageRecords.map((i) => i.url);
            await prisma.product.update({
              where: { id: newProduct.id },
              data: { image: cover.url, gallery: galleryUrls },
            });
          }

          // Copy variants
          if (product.variants.length > 0) {
            const variantRecords = product.variants.map((v) => ({
              productId: newProduct.id,
              name: v.name,
              size: v.size,
              price: v.price,
              salePrice: v.salePrice,
              stock: 0,
              sku: v.sku ? `${v.sku}-COPY` : "",
              barcode: "",
              image: v.image,
              weight: v.weight,
              sortOrder: v.sortOrder,
              status: "Active" as const,
              isDefault: v.isDefault,
            }));

            await prisma.productVariant.createMany({ data: variantRecords });
          }

          created.push(newProduct.id);
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "PRODUCT_BULK");
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = `${baseSlug}-copy`;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-copy-${counter}`;
    counter++;
  }
  return slug;
}
