import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseAdminProductPagination, parseAdminProductSort, productSearchTerms, normalizeProductSearch } from "@/lib/admin-product-list";

export function adminProductPredicate(params: URLSearchParams) {
  const filters: Prisma.Sql[] = [];
  const status = params.get("status");
  if (status && ["Draft", "Active", "Hidden", "Archived"].includes(status)) filters.push(Prisma.sql`p.status::text = ${status}`);
  if (params.get("categoryId")) filters.push(Prisma.sql`p."categoryId" = ${params.get("categoryId")}`);
  if (params.get("collectionId")) filters.push(Prisma.sql`p."collectionId" = ${params.get("collectionId")}`);
  for (const key of ["featured", "isBestSeller"] as const) {
    const value = params.get(key);
    if (value === "true" || value === "false") filters.push(Prisma.sql`${Prisma.raw('p."' + key + '"')} = ${value === "true"}`);
  }
  if (params.get("stock") === "in") filters.push(Prisma.sql`p.stock > 0`);
  if (params.get("stock") === "out") filters.push(Prisma.sql`p.stock <= 0`);
  if (params.get("stock") === "low") filters.push(Prisma.sql`p.stock > 0 AND p.stock <= p."lowStockThreshold"`);
  if (["true", "false"].includes(params.get("hasVariants") || "")) {
    const exists = Prisma.sql`EXISTS (SELECT 1 FROM product_variants v WHERE v."productId" = p.id)`;
    filters.push(params.get("hasVariants") === "true" ? exists : Prisma.sql`NOT ${exists}`);
  }
  // Explicit letter ranges also work on local databases created with the C locale.
  const marks = "[\u0300-\u036f\u0640\u064b-\u065f\u0670\u06d6-\u06ed]";
  const other = "[^a-z0-9\u0621-\u063a\u0641-\u064a\u0660-\u0669\u0671-\u06d3]";
  const normalized = (field: string) => Prisma.sql`regexp_replace(lower(regexp_replace(normalize(coalesce(${Prisma.raw(field)}, ''), NFKD), ${marks}, '', 'g')), ${other}, '', 'g')`;
  const fields = ["p.name", "p.sku", "p.barcode", "p.brand", "p.slug", "c.name", "l.name"];
  const terms = productSearchTerms(params.get("search"));
  if (normalizeProductSearch(params.get("search")) && !terms.length) filters.push(Prisma.sql`FALSE`);
  for (const term of terms) filters.push(Prisma.sql`(${Prisma.join(fields.map(field => Prisma.sql`${normalized(field)} LIKE ${'%' + term + '%'}`), " OR ")})`);
  if (params.get("brand")) {
    const brand = productSearchTerms(params.get("brand")).join("");
    filters.push(Prisma.sql`${normalized("p.brand")} LIKE ${'%' + brand + '%'}`);
  }
  return filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}` : Prisma.empty;
}

export async function getAdminProductPage(params: URLSearchParams) {
  const filter = adminProductPredicate(params);
  const from = Prisma.sql`FROM products p LEFT JOIN categories c ON c.id = p."categoryId" LEFT JOIN collections l ON l.id = p."collectionId" ${filter}`;
  const { page: requestedPage, pageSize } = parseAdminProductPagination(params);
  const sort = parseAdminProductSort(params.get("sort"));
  const sortSql: Record<typeof sort, Prisma.Sql> = {
    newest: Prisma.sql`p."createdAt" DESC, p.id ASC`, oldest: Prisma.sql`p."createdAt" ASC, p.id ASC`,
    "name-asc": Prisma.sql`p.name ASC, p.id ASC`, "name-desc": Prisma.sql`p.name DESC, p.id ASC`,
    "stock-asc": Prisma.sql`p.stock ASC, p.id ASC`, "stock-desc": Prisma.sql`p.stock DESC, p.id ASC`,
  };
  return prisma.$transaction(async tx => {
    const [count] = await tx.$queryRaw<{ total: number }[]>(Prisma.sql`SELECT count(*)::int AS total ${from}`);
    const total = count.total, totalPages = Math.max(1, Math.ceil(total / pageSize)), page = Math.min(requestedPage, totalPages);
    const ids = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`SELECT p.id ${from} ORDER BY ${sortSql[sort]} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`);
    const products = ids.length ? await tx.product.findMany({ where: { id: { in: ids.map(row => row.id) } }, include: { category: { select: { id: true, name: true } }, collection: { select: { id: true, name: true } }, images: { where: { isCover: true }, take: 1 }, _count: { select: { variants: true } } } }) : [];
    const positions = new Map(ids.map((row, index) => [row.id, index]));
    products.sort((a,b) => positions.get(a.id)! - positions.get(b.id)!);
    return { products, pagination: { page, pageSize, total, totalPages } };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
}
