import type { Prisma, ProductStatus } from "@/generated/prisma/client";

export const ADMIN_PRODUCT_PAGE_SIZE = 20;
export const ADMIN_PRODUCT_PAGE_SIZE_MAX = 100;

export type AdminProductSort =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "stock-asc"
  | "stock-desc";

export function normalizeProductSearch(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function positiveInteger(value: string | null, fallback: number, maximum?: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  const safe = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return maximum ? Math.min(safe, maximum) : safe;
}

export function parseAdminProductPagination(searchParams: URLSearchParams) {
  return {
    page: positiveInteger(searchParams.get("page"), 1),
    pageSize: positiveInteger(
      searchParams.get("pageSize"),
      ADMIN_PRODUCT_PAGE_SIZE,
      ADMIN_PRODUCT_PAGE_SIZE_MAX,
    ),
  };
}

export function parseAdminProductSort(value: string | null): AdminProductSort {
  const allowed: AdminProductSort[] = [
    "newest",
    "oldest",
    "name-asc",
    "name-desc",
    "stock-asc",
    "stock-desc",
  ];
  return allowed.includes(value as AdminProductSort) ? (value as AdminProductSort) : "newest";
}

export function adminProductOrderBy(sort: AdminProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "oldest": return [{ createdAt: "asc" }, { id: "asc" }];
    case "name-asc": return [{ name: "asc" }, { id: "asc" }];
    case "name-desc": return [{ name: "desc" }, { id: "asc" }];
    case "stock-asc": return [{ stock: "asc" }, { id: "asc" }];
    case "stock-desc": return [{ stock: "desc" }, { id: "asc" }];
    default: return [{ createdAt: "desc" }, { id: "asc" }];
  }
}

export function buildAdminProductWhere(
  searchParams: URLSearchParams,
  lowStockThreshold: Prisma.IntFieldRefInput<"Product">,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};
  const status = searchParams.get("status");
  const featured = searchParams.get("featured");
  const isBestSeller = searchParams.get("isBestSeller");
  const stock = searchParams.get("stock");
  const hasVariants = searchParams.get("hasVariants");
  const search = normalizeProductSearch(searchParams.get("search"));

  if (status && ["Draft", "Active", "Hidden", "Archived"].includes(status)) {
    where.status = status as ProductStatus;
  }
  if (searchParams.get("categoryId")) where.categoryId = searchParams.get("categoryId")!;
  if (searchParams.get("collectionId")) where.collectionId = searchParams.get("collectionId")!;
  if (featured === "true" || featured === "false") where.featured = featured === "true";
  if (isBestSeller === "true" || isBestSeller === "false") where.isBestSeller = isBestSeller === "true";
  if (searchParams.get("brand")) {
    where.brand = { contains: normalizeProductSearch(searchParams.get("brand")), mode: "insensitive" };
  }
  if (stock === "in") {
    where.stock = { gt: 0 };
  } else if (stock === "out") {
    where.stock = { lte: 0 };
  } else if (stock === "low") {
    where.stock = { gt: 0, lte: lowStockThreshold };
  }
  if (hasVariants === "true") where.variants = { some: {} };
  if (hasVariants === "false") where.variants = { none: {} };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { barcode: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
      { category: { is: { name: { contains: search, mode: "insensitive" } } } },
    ];
  }
  return where;
}

export function isLowStock(stock: number, lowStockThreshold: number): boolean {
  return stock > 0 && stock <= lowStockThreshold;
}
