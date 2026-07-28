import { Hero } from "@/components/Hero";
import {
  TrustStrip,
  FeaturedProducts,
  CollectionsShowcase,
  BrandStory,
  BestSellers,
  BuildYourBox,
  HowItWorks,
  SocialProof,
  MoroccanMoment,
  Newsletter,
  FAQSection,
  FinalCTA,
} from "@/components/HomepageCommerce";
import { getProducts, getTestimonials, getSiteSettings, getLandingCollections, getFAQ } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, testimonialRows, allProducts, landingCollections, faqs] =
    await Promise.all([
      getSiteSettings(),
      getTestimonials(),
      getProducts(),
      getLandingCollections(),
      getFAQ(),
    ]);

  const hero = settings.hero;

  const testimonials = testimonialRows
    .filter((t) => t.visible)
    .map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  const shopProducts = allProducts.slice(0, 4);
  const bestSellers = allProducts.slice(0, 4);
  const bundleProducts = allProducts.slice(0, 8);
  const faqList = faqs || [];

  return (
  <div className="bg-black">
      {/* 02 — Hero */}
      {hero.enabled && <Hero settings={hero} />}

      {/* 03 — Trust Strip */}
      <TrustStrip />

      {/* 04 — Featured Products */}
      {shopProducts.length > 0 && <FeaturedProducts products={shopProducts} />}

      {/* 05 — Collections */}
      {landingCollections.length > 0 && (
        <CollectionsShowcase collections={landingCollections} />
      )}

      {/* 07 — Best Sellers */}
      {bestSellers.length > 0 && <BestSellers products={bestSellers} />}

      {/* 08 — Build Your Box */}
      {bundleProducts.length > 1 && <BuildYourBox products={bundleProducts} />}

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

      {/* 13 — FAQ */}
      <FAQSection faqs={faqList} />

      {/* 14 — Final CTA */}
      <FinalCTA />
    </div>
  );
}