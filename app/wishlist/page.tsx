import { getProducts } from "@/lib/db";
import { WishlistPageClient } from "@/components/WishlistPageClient";
import type { Product } from "@/types";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { FadeIn } from "@/components/MotionWrappers";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("wishlist");
  const rows = await getProducts();
  const products: Product[] = rows;

  return (
    <div className="container-premium py-8 md:py-14">
      <FadeIn>
        <div className="mb-8 text-center">
          <p className="label-utility">
            {t(translations, "saved_label", lang)}
          </p>
          <h1 className="font-display mt-4 text-display-sm sm:text-display-md text-ivory">
            {t(translations, "wishlist_title", lang)}
          </h1>
          <div className="mx-auto mt-5 h-px w-8 bg-ivory/[0.05]" />
        </div>
      </FadeIn>
      <WishlistPageClient products={products} />
    </div>
  );
}
