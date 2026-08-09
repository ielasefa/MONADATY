import React from "react";
import { Hero } from "@/components/Hero";
import {
  FeaturedProducts,
  CollectionsShowcase,
  BrandStory,
  SocialProof,
  MoroccanMoment,
  Newsletter,
  FinalCTA,
} from "@/components/HomepageCommerce";
import { getLandingFeaturedProducts, getTestimonials, getLandingCollections, getLandingContent, getCollectionShowcase } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MONADATY — Soda, Water, Juice & More",
  description:
    "Shop sodas, water, juices and more at great prices, with easy ordering and convenient delivery.",
};

export default async function HomePage() {
  const [content, testimonialRows, landingProducts, landingCollections, collectionShowcase] =
    await Promise.all([
      getLandingContent(),
      getTestimonials(),
      getLandingFeaturedProducts(),
      getLandingCollections(),
      getCollectionShowcase(),
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
    : ["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "newsletter", "final_cta"];

  const firstProduct = landingProducts[0];
  const heroFallbackImage = firstProduct?.image?.trim() || firstProduct?.gallery?.[0]?.trim() || undefined;

  return (
    <>
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDesc && <meta name="description" content={seoDesc} />}
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDesc && <meta property="og:description" content={seoDesc} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <div className="home-premium overflow-x-clip bg-[#0B0B0A] [--home-gold:#D6B35A] [--home-gold-hover:#E6CC88] [--home-gold-dark:#A7893F]">
        {(() => {
          const map: Record<string, React.ReactNode> = {};

          if (content.hero.enabled) {
            map.hero = <Hero settings={{
              title: content.hero.title,
              subtitle: content.hero.subtitle,
              description: content.hero.description,
              ctaText: content.hero.ctaText,
              ctaLink: content.hero.ctaLink,
              media: content.hero.media,
            }}
              fallbackImage={heroFallbackImage}
            />;
          }

          if (landingProducts.length > 0 && content.featuredProducts.enabled) {
  map.featured = <FeaturedProducts products={landingProducts} />;
}

          if (landingCollections.length > 0 && content.collectionsSection.enabled) {
            map.collections = <CollectionsShowcase collections={landingCollections} showcase={collectionShowcase} />;
          }

          if (content.aboutSection.enabled) {
            map.about = (
              <BrandStory
                title={content.aboutSection.title}
                description={content.aboutSection.description}
                image={content.aboutSection.image}
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

          if (content.newsletter.enabled) {
            map.newsletter = (
              <Newsletter
                title={content.newsletter.title}
                description={content.newsletter.description}
                placeholder={content.newsletter.placeholder}
                buttonText={content.newsletter.buttonText}
              />
            );
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
