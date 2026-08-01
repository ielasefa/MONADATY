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
import { getProducts, getTestimonials, getLandingCollections, getLandingContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MONADATY — Premium Moroccan Beverages",
  description: "Premium Moroccan beverages, crafted with intention. Born in Casablanca.",
};

export default async function HomePage() {
  const [content, testimonialRows, allProducts, landingCollections] =
    await Promise.all([
      getLandingContent(),
      getTestimonials(),
      getProducts(),
      getLandingCollections(),
    ]);

  // Apply SEO overrides
  const seoTitle = content.seo?.title;
  const seoDesc = content.seo?.metaDescription;
  const ogImage = content.seo?.ogImage;

  const testimonials = testimonialRows
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  const shopProducts = allProducts.slice(0, 4);
  const sectionOrder = (content.sectionOrder || []).length > 0
    ? content.sectionOrder
    : ["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "newsletter", "final_cta"];

  return (
    <>
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDesc && <meta name="description" content={seoDesc} />}
      {seoTitle && <meta property="og:title" content={seoTitle} />}
      {seoDesc && <meta property="og:description" content={seoDesc} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <div className="bg-black">
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
            }} />;
          }

          if (shopProducts.length > 0 && content.featuredProducts.enabled) {
            map.featured = <FeaturedProducts products={shopProducts} />;
          }

          if (landingCollections.length > 0 && content.collectionsSection.enabled) {
            map.collections = <CollectionsShowcase collections={landingCollections} />;
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
            map.moroccan_moment = <MoroccanMoment />;
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

          return sectionOrder.map((key) => map[key]).filter(Boolean);
        })()}
      </div>
    </>
  );
}
