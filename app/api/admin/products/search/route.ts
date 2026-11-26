import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const warehouseId = searchParams.get("warehouseId")?.trim();
  if (query.length < 2) {
    return NextResponse.json({ products: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const rows = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { name: "asc" },
      take: 10,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        ...(warehouseId
          ? {
              warehouseStocks: {
                where: { warehouseId, variantId: "" },
                select: { stock: true },
                take: 1,
              },
            }
          : {}),
      },
    });

    const products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: warehouseId
        ? ("warehouseStocks" in product ? product.warehouseStocks[0]?.stock : undefined) ?? 0
        : product.stock,
    }));
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logError(error, "ADMIN_PRODUCT_SEARCH");
    return NextResponse.json({ products: [] }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
