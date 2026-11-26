"use client";

import { categoryLabel } from "@/lib/category-label";
import Link from "next/link";
import { MarketIcon } from "@/components/MarketIcon";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

export type MarketCategory = { slug: string; name: string; image?: string; productImage?: boolean };

const services = {
  fr: ["Livraison aux commerces", "Prix de gros", "Commande en ligne", "Assistance professionnelle"],
  en: ["Delivery to your business", "Wholesale pricing", "Online ordering", "Business support"],
  ar: ["التوصيل إلى متجرك", "أسعار الجملة", "الطلب عبر الإنترنت", "دعم المهنيين"],
};

const categoryTitle = { fr: "Nos catégories", en: "Shop by category", ar: "تسوق حسب الفئة" };
const allCategories = { fr: "Tout le catalogue", en: "Browse the catalogue", ar: "تصفح الكتالوج" };
const icons = ["truck", "box", "shield", "headset"] as const;

function categoryArtwork(slug: string) {
  if (/energy|energ/.test(slug)) return "energy";
  if (/water|eaux?/.test(slug)) return "water";
  if (/juice|jus|cappy/.test(slug)) return "juice";
  if (/soda|cola|sprite|fanta|poms|schweppes/.test(slug)) return "soda";
  return "other";
}

export function MarketDepartments({ categories }: { categories: MarketCategory[] }) {
  const { lang } = useTranslation("home");

  return (
    <>
      <ul className="market-services market-container">
        {icons.map((icon, index) => (
          <li key={icon}><MarketIcon name={icon} /><span>{services[lang][index]}</span></li>
        ))}
      </ul>
      {categories.length > 0 && (
        <section className="market-container market-departments" id="categories" aria-labelledby="departments-title">
          <div className="market-section-heading">
            <h2 id="departments-title">{categoryTitle[lang]}</h2>
            <Link href="/shop">{allCategories[lang]} <MarketIcon name="arrow" /></Link>
          </div>
          <ul className="market-category-grid">
            {categories.slice(0, 4).map(({ slug, name, image, productImage }) => (
              <li key={slug}>
                <Link href={`/shop?category=${encodeURIComponent(slug)}`} className="market-category" data-product-image={productImage || undefined}>
                  <SafeImage src={image?.trim() || `/images/storefront/category-${categoryArtwork(slug)}.webp`} alt="" fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw" className={productImage ? "object-contain p-1 pe-[30%]" : "object-cover"} fallback={<span className="market-category-fallback" />} />
                  <span>{categoryLabel(name, lang)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
