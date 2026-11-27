"use client";

import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
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

const featureBar = {
  fr: [
    { icon: "truck",   label: "Livraison rapide",    sub: "et fiable" },
    { icon: "box",     label: "Prix de gros",        sub: "avantageux" },
    { icon: "shield",  label: "Commande",            sub: "sécurisée" },
  ],
  en: [
    { icon: "truck",   label: "Fast delivery",       sub: "and reliable" },
    { icon: "box",     label: "Wholesale prices",    sub: "competitive" },
    { icon: "shield",  label: "Secure",              sub: "ordering" },
  ],
  ar: [
    { icon: "truck",   label: "توصيل سريع",          sub: "وموثوق" },
    { icon: "box",     label: "أسعار الجملة",        sub: "تنافسية" },
    { icon: "shield",  label: "طلب",                 sub: "آمن" },
  ],
} as const;

function FeatureIcon({ name }: { name: string }) {
  if (name === "truck") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  );
  if (name === "box") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export function Hero({ settings, fallbackImage, preview = false, collectionsHref: _collectionsHref = "/collections" }: { settings: HeroSettings; fallbackImage?: string; preview?: boolean; collectionsHref?: string }) {
  const { lang } = useTranslation("home");
  const { hero } = getLandingCopy(lang);
  if (!preview) {
    const heroImages = {
      fr: "/images/storefront/monadaty-hero-fr.png",
      en: "/images/storefront/monadaty-hero-en.png",
      ar: "/images/storefront/monadaty-hero-ar.png",
    } as const;
    const catalogHotspots = {
      fr: { left: "9.2%", top: "71%", width: "22%", height: "12%" },
      en: { left: "14.3%", top: "70%", width: "20.5%", height: "12%" },
      ar: { left: "18.3%", top: "72%", width: "19%", height: "11%" },
    } as const;
    return (
      <section className="market-hero market-hero-reference" data-language={lang} aria-label={hero.imageAlt}>
        <Image
          src={heroImages[lang]}
          alt={hero.imageAlt}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 96vw"
          className="market-hero-reference-image"
        />
        <div className="market-hero-approved-brand"><BrandLogo width={260} height={87} priority /></div>
        <Link className="market-hero-reference-shop" href={settings.ctaLink || "/shop"} style={catalogHotspots[lang]} aria-label={hero.primaryCta} />
      </section>
    );
  }
  const customImage = preview ? settings.media[0]?.trim() || fallbackImage?.trim() : undefined;
  const localizedTitle = lang === "fr" ? "Approvisionnez\nvotre commerce" : hero.title;
  const text = (value: string, fallback: string, seeds: string[]) => preview ? value || fallback : landingText(value, fallback, seeds);
  const title = text(settings.title, localizedTitle, ["Your daily soda is ready", "WHOLESALE\nBEVERAGES."]);

  const badgeText = { fr: "VOTRE GROSSISTE DE BOISSONS", en: "YOUR WHOLESALE DRINKS PARTNER", ar: "مورّدك للمشروبات بالجملة" }[lang];
  const features = featureBar[lang];

  return (
    <section className="market-hero market-hero-v2" data-custom-image={Boolean(customImage)}>

      {/* Background image */}
      <div className="market-hero-media">
        {customImage ? (
          <SafeImage
            key={customImage}
            src={customImage}
            alt={hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            fallback={<Image src={editorialImage} alt="" fill sizes="100vw" className="object-cover object-right" />}
          />
        ) : (
          <Image src={editorialImage} alt="" fill priority sizes="100vw" className="object-cover object-right" />
        )}
      </div>

      {/* Gradient overlay */}
      <div className="market-hero-shade" aria-hidden="true" />

      {/* Diagonal gold accent line */}
      <div className="market-hero-gold-line" aria-hidden="true" />

      {/* Copy */}
      <div className="market-hero-copy market-hero-copy-v2">
        {/* Badge */}
        <span className="market-hero-badge">{badgeText}</span>

        <h1>{title}</h1>

        <p className="market-hero-description">
          {text(settings.description, hero.description, [
            "MONADATY brings you an elevated soda experience.",
            "A wide range of wholesale beverages for your business.",
          ])}
        </p>

        <div className="market-hero-actions">
          <Link className="market-gold-button" href={settings.ctaLink || "/shop"}>
            {text(settings.ctaText, hero.primaryCta, ["Shop Now", "Order from MONADATY"])}
            <MarketIcon name="arrow" />
          </Link>
        </div>
      </div>

      {/* Feature bar at bottom */}
      <div className="market-hero-features" aria-label="Nos engagements">
        {features.map((f) => (
          <div key={f.label} className="market-hero-feature">
            <span className="market-hero-feature-icon">
              <FeatureIcon name={f.icon} />
            </span>
            <span>
              <strong>{f.label}</strong>
              <span className="market-hero-feature-sub">{f.sub}</span>
            </span>
          </div>
        ))}
      </div>

    </section>
  );
}
