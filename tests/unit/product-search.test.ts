import { describe, expect, it } from "vitest";
import { matchesProductSearch, normalizeSearchTerm, normalizeSearchValue } from "@/lib/product-search";
import type { Product } from "@/types";

const coca: Product = {
  id: "p1",
  name: "Coca Cola Original",
  sku: "COCA-330",
  barcode: "611100000001",
  brand: "Coca-Cola",
  category: "Soft Drinks",
  price: "8.00 DH",
  image: "",
  description: "",
  gallery: [],
  lowStockThreshold: 5,
};

describe("storefront product search", () => {
  it.each(["Coca Cola Original", "coca", "COCA", "  coca   cola  "])(
    "finds exact, partial, case-insensitive and whitespace-normalized name: %s",
    (query) => expect(matchesProductSearch(coca, query)).toBe(true),
  );

  it.each(["COCA-330", "6111000", "soft drinks", "coca-cola"])(
    "uses existing SKU, barcode, category and brand fields: %s",
    (query) => expect(matchesProductSearch(coca, query)).toBe(true),
  );

  it("clearing search restores every product", () => {
    expect(matchesProductSearch(coca, "")).toBe(true);
    expect(matchesProductSearch({ ...coca, name: "Water" }, "   ")).toBe(true);
  });

  it("does not match unrelated products", () => {
    expect(matchesProductSearch(coca, "mineral water")).toBe(false);
  });

  it("normalizes repeated whitespace", () => {
    expect(normalizeSearchTerm("  COCA   COLA ")).toBe("coca cola");
    expect(normalizeSearchValue("  COCA   COLA ")).toBe("COCA COLA");
    expect(matchesProductSearch({ ...coca, name: "Coca   Cola Original" }, "coca cola")).toBe(true);
  });
});
