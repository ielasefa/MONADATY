import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import type { Prisma, ProductStatus } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;

    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const collectionId = searchParams.get("collectionId");
    const featured = searchParams.get("featured");
    const isBestSeller = searchParams.get("isBestSeller");
    const brand = searchParams.get("brand");
    const stock = searchParams.get("stock");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const hasVariants = searchParams.get("hasVariants");
    const search = searchParams.get("search");

    const where: Prisma.ProductWhereInput = {};

    if (status && ["Draft", "Active", "Hidden", "Archived"].includes(status)) {
      where.status = status as ProductStatus;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (collectionId) {
      where.collectionId = collectionId;
    }
    if (featured === "true") {
      where.featured = true;
    } else if (featured === "false") {
      where.featured = false;
    }
    if (isBestSeller === "true") {
      where.isBestSeller = true;
    } else if (isBestSeller === "false") {
      where.isBestSeller = false;
    }
    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }
    if (stock === "in") {
      where.stock = { gt: 0 };
    } else if (stock === "out") {
      where.stock = { lte: 0 };
    } else if (stock === "low") {
      where.AND = [
        { stock: { gt: 0 } },
        { stock: { lte: 5 } },
      ];
    }
    if (minPrice || maxPrice) {
      const priceFilter: Record<string, unknown> = {};
      if (minPrice) priceFilter.gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
    }
    if (hasVariants === "true") {
      where.variants = { some: {} };
    } else if (hasVariants === "false") {
      where.variants = { none: {} };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
        images: { where: { isCover: true }, take: 1 },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json({ products });
  } catch (err) {
    logError(err, "Failed to fetch products:");
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
