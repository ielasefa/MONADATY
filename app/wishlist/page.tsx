import { getProducts } from "@/lib/db";
import { WishlistPageClient } from "@/components/WishlistPageClient";
import type { Product } from "@/types";
import { getLanguage } from "@/lib/translations";
import { getLandingCopy } from "@/lib/landing-copy";
import { FadeIn } from "@/components/motion/FadeIn";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang);
  const rows = await getProducts();
  const products: Product[] = rows;

  return (
    <div className="wishlist-page bg-canvas">
      <section className="wishlist-heading" aria-labelledby="wishlist-title">
        <div className="storefront-container wishlist-intro">
          <FadeIn y={10} duration={0.4}>
            <p className="storefront-eyebrow"><span aria-hidden="true" />{copy.wishlist.eyebrow}</p>
            <h1 id="wishlist-title" className="storefront-page-title">{copy.wishlist.title}</h1>
            <p className="wishlist-description">{copy.wishlist.description}</p>
          </FadeIn>
        </div>
      </section>

      <section className="wishlist-content">
        <div className="storefront-container">
          <WishlistPageClient products={products} />
        </div>
      </section>
    </div>
  );
}
