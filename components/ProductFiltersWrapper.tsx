import { getCategories } from "@/lib/db";
import { loadProducts } from "@/lib/data";
import { ProductFilters } from "@/components/ProductFilters";
import type { Product } from "@/types";

export async function ProductFiltersWrapper() {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      loadProducts(),
    ]);

    return (
      <ProductFilters
        categories={categories.map(c => ({ slug: c.slug, name: c.name }))}
        products={products}
      />
    );
  } catch {
    return <ProductFilters categories={[]} />;
  }
}

export function ProductFiltersSync({ categories, products }: { categories: { slug: string; name: string }[]; products: Product[] }) {
  return (
    <ProductFilters
      categories={categories}
      products={products}
    />
  );
}
