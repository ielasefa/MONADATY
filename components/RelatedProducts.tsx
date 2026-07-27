"use client";

import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type RelatedProductsProps = {
  products: Product[];
};

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useTranslation("products");
  return (
    <section className="space-y-8 pt-4 md:pt-8">
      <div className="space-y-3">
        <p className="label-utility tracking-[0.3em] text-gold/40">{t("related_products")}</p>
        <h2 className="font-display text-display-sm text-ivory md:text-display-md">
          {t("you_may_also_like")}
        </h2>
      </div>

      <div className="h-px w-full bg-ivory/[0.04]" />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
