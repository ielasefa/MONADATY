import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import {
  adminProductOrderBy,
  buildAdminProductWhere,
  parseAdminProductPagination,
  parseAdminProductSort,
} from "@/lib/admin-product-list";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;

    const where = buildAdminProductWhere(searchParams, prisma.product.fields.lowStockThreshold);
    const { page: requestedPage, pageSize } = parseAdminProductPagination(searchParams);
    const sort = parseAdminProductSort(searchParams.get("sort"));

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const products = await prisma.product.findMany({
      where,
      orderBy: adminProductOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { id: true, name: true } },
        collection: { select: { id: true, name: true } },
        images: { where: { isCover: true }, take: 1 },
        _count: { select: { variants: true } },
      },
    });

    return NextResponse.json({
      products,
      pagination: { page, pageSize, total, totalPages },
    });
  } catch (err) {
    logError(err, "Failed to fetch products:");
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
