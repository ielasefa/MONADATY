import { Hero } from "@/components/Hero";
import { QuietTransition } from "@/components/QuietTransition";
import {
  SectionFeatured,
  SectionCollections,
  SectionAbout,
  SectionTestimonials,
  SectionNewsletter,
  SectionCTA,
} from "@/components/HomepageCommerce";
import { getFeaturedProducts, getTestimonials, getSiteSettings, getLandingCollections } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, testimonialRows, featuredProducts, landingCollections] = await Promise.all([
    getSiteSettings(),
    getTestimonials(),
    getFeaturedProducts(),
    getLandingCollections(),
  ]);

  const testimonials = testimonialRows
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  const hero = settings.hero;
  const nineProducts = featuredProducts.slice(0, 9);

  return (
    <div>
      {/* 1. HERO — full viewport editorial composition */}
      {hero.enabled && <Hero settings={hero} />}

      {/* 2. QUIET TRANSITION — breathing room, intentional whitespace */}
      {hero.enabled && <QuietTransition />}

      {/* 3. OUR STORY — editorial scene, not image|text */}
      {settings.aboutSection.enabled && <SectionAbout
        title={settings.aboutSection.title}
        subtitle={settings.aboutSection.subtitle}
        description={settings.aboutSection.description}
        image={settings.aboutSection.image}
      />}

      {/* 4. SHOP BY COLLECTION — three campaign chapters */}
      {settings.collectionsSection.enabled && landingCollections.length > 0 && (
        <SectionCollections
          collections={landingCollections}
          title={settings.collectionsSection.title}
          subtitle={settings.collectionsSection.subtitle}
        />
      )}

      {/* 5. FEATURED PRODUCTS — 9-product exhibition, varied scales */}
      {settings.featuredProducts.enabled && nineProducts.length > 0 && (
        <SectionFeatured
          featuredProducts={nineProducts}
          title={settings.featuredProducts.title}
          subtitle={settings.featuredProducts.subtitle}
        />
      )}

      {/* 6. TESTIMONIALS — one giant voice */}
      {settings.testimonialsSection.enabled && testimonials.length > 0 && (
        <SectionTestimonials
          testimonials={testimonials}
          title={settings.testimonialsSection.title}
          subtitle={settings.testimonialsSection.subtitle}
        />
      )}

      {/* 7. NEWSLETTER — minimal, no container */}
      {settings.newsletter.enabled && (
        <SectionNewsletter
          title={settings.newsletter.title}
          subtitle={settings.newsletter.subtitle}
          description={settings.newsletter.description}
          placeholder={settings.newsletter.placeholder}
          buttonText={settings.newsletter.buttonText}
        />
      )}

      {/* 8. FINAL CTA — near-empty black scene */}
      <SectionCTA />
   </div>
  );
}
