import React from "react";
import { Hero } from "@/components/Hero";
import { MarketDepartments } from "@/components/MarketDepartments";
import {
  FeaturedProducts,
  CollectionsShowcase,
  BrandStory,
  SocialProof,
  MoroccanMoment,
  FinalCTA,
} from "@/components/HomepageCommerce";
import { getLandingFeaturedProducts, getTestimonials, getLandingCollections, getLandingContent, getCollectionShowcase, getCategories, getProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, testimonialRows, landingProducts, landingCollections, collectionShowcase, categories, products] =
    await Promise.all([
      getLandingContent(),
      getTestimonials(),
      getLandingFeaturedProducts(),
      getLandingCollections(),
      getCollectionShowcase(),
      getCategories(),
      getProducts(),
    ]);

  // Apply SEO overrides
  const seoTitle = content.seo?.title;
  const seoDesc = content.seo?.metaDescription;
  const ogImage = content.seo?.ogImage;

  const testimonials = testimonialRows
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  // Landing products come directly from the CMS selection — no automatic fallback.
  // If no products are selected, the featured section is simply not rendered.

  const sectionOrder = (content.sectionOrder || []).length > 0
    ? content.sectionOrder
    : ["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "final_cta"];

  const showsCollections = landingCollections.length > 0 && content.collectionsSection.enabled;
  const firstProduct = landingProducts[0];
  const departments = <MarketDepartments categories={categories.filter((category) => products.some((product) => product.category === category.name)).map(({ slug, name, image }) => {
    const productImage = products.find((product) => product.category === name && product.image)?.image;
    return { slug, name, image: image || productImage, productImage: !image && Boolean(productImage) };
  })} />;

  return (
    <>
      {seoDesc && <meta name="description" content={seoDesc} />}
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDesc && <meta property="og:description" content={seoDesc} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <div className="home-premium overflow-x-clip">
        {(!content.hero.enabled || !sectionOrder.includes("hero")) && departments}
        {(() => {
          const map: Record<string, React.ReactNode> = {};

          if (content.hero.enabled) {
            map.hero = (
              <>
                <Hero settings={content.hero} fallbackImage={firstProduct?.image} collectionsHref={showsCollections && sectionOrder.includes("collections") ? "#collections" : "/collections"} />
                {departments}
              </>
            );
          }

          if (landingProducts.length > 0 && content.featuredProducts.enabled) {
            map.featured = <FeaturedProducts products={landingProducts} />;
          }

          if (showsCollections) {
            map.collections = <CollectionsShowcase collections={landingCollections} showcase={collectionShowcase} />;
          }

          if (content.aboutSection.enabled) {
            map.about = (
              <BrandStory
                title={content.aboutSection.title}
                description={content.aboutSection.description}
                image={content.aboutSection.image || "/images/storefront/monadaty-wholesale-supply.png"}
              />
            );
          }

          if (testimonials.length > 0 && content.testimonialsSection.enabled) {
            map.testimonials = (
              <SocialProof
                testimonials={testimonials}
                title={content.testimonialsSection.title}
                subtitle={content.testimonialsSection.subtitle}
              />
            );
          }

          if (content.moroccanMoment.enabled) {
            map.moroccan_moment = <MoroccanMoment product={firstProduct} />;
          }

          if (content.finalCta.enabled) {
            map.final_cta = <FinalCTA />;
          }

          return sectionOrder.map((k) => <React.Fragment key={k}>{map[k]}</React.Fragment>).filter(Boolean);
        })()}
      </div>

    </>
  );
}
