import type { Product } from "@/types";

export function normalizeSearchValue(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSearchTerm(value: string): string {
  return normalizeSearchValue(value).toLocaleLowerCase();
}

export function matchesProductSearch(product: Product, value: string): boolean {
  const query = normalizeSearchTerm(value);
  if (!query) return true;
  const searchable = [
    product.name,
    product.sku,
    product.barcode,
    product.brand,
    product.category,
  ]
    .filter((field): field is string => Boolean(field))
    .join(" ");
  return normalizeSearchTerm(searchable).includes(query);
}
