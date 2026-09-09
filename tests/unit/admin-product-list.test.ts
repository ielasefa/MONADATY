import { describe, expect, it } from "vitest";
import {
  adminProductOrderBy,
  buildAdminProductWhere,
  isLowStock,
  parseAdminProductPagination,
  parseAdminProductSort,
} from "@/lib/admin-product-list";
import type { Prisma } from "@/generated/prisma/client";

const thresholdRef = { _ref: "lowStockThreshold", _container: "Product" } as unknown as Prisma.IntFieldRefInput<"Product">;

describe("admin product list filters", () => {
  it("combines normalized search, category and per-product low stock", () => {
    const where = buildAdminProductWhere(
      new URLSearchParams("search=%20COCA+++COLA%20&categoryId=cat-1&stock=low"),
      thresholdRef,
    );
    expect(where.categoryId).toBe("cat-1");
    expect(where.stock).toEqual({ gt: 0, lte: thresholdRef });
    expect(where.OR).toContainEqual({ name: { contains: "COCA COLA", mode: "insensitive" } });
    expect(where.OR).toContainEqual({ category: { is: { name: { contains: "COCA COLA", mode: "insensitive" } } } });
  });

  it.each([
    ["in", { gt: 0 }],
    ["out", { lte: 0 }],
    ["low", { gt: 0, lte: thresholdRef }],
  ])("builds the %s-stock predicate", (stock, expected) => {
    expect(buildAdminProductWhere(new URLSearchParams({ stock }), thresholdRef).stock).toEqual(expected);
  });

  it("uses the existing low-stock boundary and excludes zero", () => {
    expect(isLowStock(3, 3)).toBe(true);
    expect(isLowStock(4, 3)).toBe(false);
    expect(isLowStock(0, 3)).toBe(false);
  });

  it("sanitizes pagination and caps page size", () => {
    expect(parseAdminProductPagination(new URLSearchParams("page=2&pageSize=500"))).toEqual({ page: 2, pageSize: 100 });
    expect(parseAdminProductPagination(new URLSearchParams("page=-1&pageSize=nope"))).toEqual({ page: 1, pageSize: 20 });
  });

  it("provides validated, stable sorting", () => {
    expect(parseAdminProductSort("invalid")).toBe("newest");
    expect(adminProductOrderBy("stock-asc")).toEqual([{ stock: "asc" }, { id: "asc" }]);
  });
});
