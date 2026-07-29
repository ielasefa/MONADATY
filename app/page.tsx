import { Hero } from "@/components/Hero";
import {
  FeaturedProducts,
  CollectionsShowcase,
  BrandStory,
  BestSellers,
  HowItWorks,
  SocialProof,
  MoroccanMoment,
  Newsletter,
  FinalCTA,
} from "@/components/HomepageCommerce";
import { getProducts, getTestimonials, getSiteSettings, getLandingCollections } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, testimonialRows, allProducts, landingCollections] =
    await Promise.all([
      getSiteSettings(),
      getTestimonials(),
      getProducts(),
      getLandingCollections(),
    ]);

  const hero = settings.hero;

  const testimonials = testimonialRows
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  const shopProducts = allProducts.slice(0, 4);
  const bestSellers = allProducts.slice(0, 4);

  return (
  <div className="bg-black">
{/* 02 — Hero */}
{hero.enabled && <Hero settings={hero} />}

{/* 04 — Featured Products */}
      {shopProducts.length > 0 && <FeaturedProducts products={shopProducts} />}

      {/* 05 — Collections */}
      {landingCollections.length > 0 && (
        <CollectionsShowcase collections={landingCollections} />
      )}

{/* 07 — Best Sellers */}
  {bestSellers.length > 0 && <BestSellers products={bestSellers} />}

  {/* 09 — How It Works */}
  <HowItWorks />

  {/* 06 — Brand Story */}
      {settings.aboutSection.enabled && (
        <BrandStory
          title={settings.aboutSection.title}
          description={settings.aboutSection.description}
          image={settings.aboutSection.image}
        />
      )}

      {/* 10 — Customer Notes */}
      {testimonials.length > 0 && (
        <SocialProof
          testimonials={testimonials}
          title={settings.testimonialsSection?.title ?? ""}
          subtitle={settings.testimonialsSection?.subtitle ?? ""}
        />
      )}

      {/* 11 — Moroccan Moment */}
      <MoroccanMoment />

{/* 12 — Newsletter */}
{settings.newsletter.enabled && (
  <Newsletter
    title={settings.newsletter.title}
    description={settings.newsletter.description}
    placeholder={settings.newsletter.placeholder}
    buttonText={settings.newsletter.buttonText}
  />
)}

{/* 14 — Final CTA */}
<FinalCTA />
    </div>
  );
}