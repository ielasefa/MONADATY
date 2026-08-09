"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/Reveal";

export function RelatedProducts({ products }: { products: Product[] }) {
  const { t } = useTranslation("products");
  const { t: tb } = useTranslation("buttons");

  return (
    <div>
      <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="storefront-eyebrow">
            <span className="h-px w-9 bg-gold" />
            {t("related_products")}
          </p>
          <h2 className="mt-4 font-display text-3xl leading-none tracking-[-0.03em] text-white md:text-4xl">
            {t("you_may_also_like")}
          </h2>
        </div>
        <Link href="/shop" className="btn-link">
          {tb("view_all", "View All")}
          <span aria-hidden="true" className="rtl:rotate-180">→</span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={Math.min(index * 0.05, 0.18)} className="h-full">
            <ProductCard {...product} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
