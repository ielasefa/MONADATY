import { getProducts } from "@/lib/db";
import { WishlistPageClient } from "@/components/WishlistPageClient";
import type { Product } from "@/types";
import { getLanguage } from "@/lib/translations";
import { getLandingCopy } from "@/lib/landing-copy";

export const dynamic = "force-dynamic";

/* ============================================================
   WISHLIST PAGE — editorial minimal
   ============================================================ */

export default async function WishlistPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang);
  const rows = await getProducts();
  const products: Product[] = rows;

return (
    <div className="bg-black">
      <section className="relative overflow-hidden border-b border-gold/[0.16] bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(214,179,90,0.09),transparent_36%)]" />
        <div className="storefront-container storefront-section relative">
          <p className="storefront-eyebrow">
            <span className="h-px w-9 bg-gold" />
            {copy.wishlist.eyebrow}
          </p>
          <h1 className="storefront-page-title mt-6">
            {copy.wishlist.title}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-[1.85] text-white/58 sm:text-[0.95rem]">
            {copy.wishlist.description}
          </p>
        </div>
      </section>

      <section>
        <div className="storefront-container py-12 md:py-16 lg:py-20">
          <WishlistPageClient products={products} />
        </div>
      </section>
    </div>
  );
}
