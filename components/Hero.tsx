"use client";

import Image from "next/image";
import Link from "next/link";
import { MarketIcon } from "@/components/MarketIcon";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCopy } from "@/lib/landing-copy";
import { landingText } from "@/lib/landing-text";

const editorialImage = "/images/storefront/wholesale-hero.webp";

type HeroSettings = {
  media: string[];
  ctaLink: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
};

export function Hero({ settings, fallbackImage, preview = false, collectionsHref = "/collections" }: { settings: HeroSettings; fallbackImage?: string; preview?: boolean; collectionsHref?: string }) {
  const { lang } = useTranslation("home");
  const { hero } = getLandingCopy(lang);
  const customImage = settings.media[0]?.trim() || fallbackImage?.trim();
  const localizedTitle = lang === "fr" ? "Approvisionnez votre commerce" : hero.title;
  const text = (value: string, fallback: string, seeds: string[]) => preview ? value || fallback : landingText(value, fallback, seeds);
  const title = text(settings.title, localizedTitle, ["Your daily soda is ready", "WHOLESALE\nBEVERAGES."]);

  return (
    <section className="market-hero" data-custom-image={Boolean(customImage)}>
      <div className="market-hero-media">
        {customImage ? (
          <SafeImage
            key={customImage}
            src={customImage}
            alt={hero.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-contain"
            fallback={<Image src={editorialImage} alt="" fill sizes="100vw" className="object-cover" />}
          />
        ) : (
          <Image src={editorialImage} alt="" fill priority sizes="(min-width: 1024px) 71vw, 100vw" className="object-cover" />
        )}
      </div>
      <div className="market-hero-shade" aria-hidden="true" />
      <div className="market-hero-copy">
        <p className="market-kicker">{text(settings.subtitle, hero.eyebrow, ["Premium soda with refined taste", "Drinks for Professionals — Delivered to You"])}</p>
        <h1>{title}</h1>
        <p className="market-hero-description">{text(settings.description, hero.description, ["MONADATY brings you an elevated soda experience.", "A wide range of wholesale beverages for your business."])}</p>
        <Link className="market-gold-button" href={settings.ctaLink || "/shop"}>
          {text(settings.ctaText, hero.primaryCta, ["Shop Now", "Order from MONADATY"]) }
          <MarketIcon name="arrow" />
        </Link>
        <Link className="market-hero-secondary" href={collectionsHref}>{hero.secondaryCta}</Link>
      </div>
    </section>
  );
}
