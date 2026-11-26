import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getLandingContent } from "@/lib/db";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLanguage } from "@/lib/translations";
import { FadeIn } from "@/components/motion/FadeIn";
import "./about.css";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const copy = getLandingCopy(await getLanguage()).about;
  return { title: copy.metadataTitle, description: copy.description, alternates: { canonical: "/about" } };
}

type IconName = "box" | "pin" | "wallet" | "bottles" | "tag" | "cart" | "truck";
const serviceIcons: IconName[] = ["box", "pin", "wallet"];
const valueIcons: IconName[] = ["bottles", "tag", "cart", "truck"];
const stepIcons: IconName[] = ["bottles", "cart", "truck"];

export default async function AboutPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang).about;
  const content = await getLandingContent();
  const image = "/images/storefront/monadaty-about-showcase.png";

  return (
    <div className="market-about">
      <section className="about-hero storefront-container" aria-labelledby="about-title">
        <FadeIn className="about-hero-copy" y={12}>
          <p className="storefront-eyebrow"><span />{copy.eyebrow}</p>
          <h1 id="about-title">{copy.title}<em>{copy.titleAccent}</em></h1>
          <p className="about-lede">{copy.description}</p>
          <div className="about-actions">
            <Link href="/shop" className="btn-primary">{copy.cta}</Link>
            <a href="#notre-engagement" className="about-text-link">{copy.secondaryCta}</a>
          </div>
        </FadeIn>
        <FadeIn className="about-hero-visual" delay={0.08} y={12}>
          <figure>
            <div className="about-image">
              <SafeImage src={image} alt={copy.imageAlt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
            </div>
            <figcaption><span className="about-image-monogram" aria-hidden="true">M</span><span>{copy.imageCaption}</span></figcaption>
          </figure>
        </FadeIn>
        <ul className="about-services">
          {copy.services.map((service, i) => <li key={service}><AboutIcon name={serviceIcons[i]} /><span>{service}</span></li>)}
        </ul>
      </section>

      <section id="notre-engagement" className="about-values-section" aria-labelledby="about-values-title">
        <div className="storefront-container about-values-layout">
          <div className="about-section-copy">
            <p className="storefront-eyebrow"><span />{copy.valuesEyebrow}</p>
            <h2 id="about-values-title">{copy.valuesTitle}</h2>
            <p>{copy.storyDescription}</p>
            <div className="about-signature"><span>MONADATY</span><span>{copy.storyTitle}</span></div>
          </div>
          <div className="about-values-grid">
            {copy.values.map((value, i) => (
              <article key={value.title} className="about-value">
                <span className="about-value-icon"><AboutIcon name={valueIcons[i]} /></span>
                <h3>{value.title}</h3><p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="storefront-container about-process-section" aria-labelledby="about-process-title">
        <div className="about-process">
          <div className="about-process-heading"><p className="storefront-eyebrow"><span />{copy.processEyebrow}</p><h2 id="about-process-title">{copy.processTitle}</h2></div>
          <ol className="about-steps">
            {copy.steps.map((step, i) => <li key={step.title}><span className="about-process-icon"><AboutIcon name={stepIcons[i]} /></span><h3>{step.title}</h3><p>{step.description}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="storefront-container about-delivery-section" aria-labelledby="about-delivery-title">
        <div className="about-delivery">
          <div className="about-section-copy">
            <p className="storefront-eyebrow"><span />{copy.deliveryEyebrow}</p>
            <h2 id="about-delivery-title">{copy.closingTitle}</h2>
            <p>{copy.deliveryDescription}</p>
            <Link href="/shop" className="btn-primary">{copy.cta}</Link>
          </div>
          <ul className="about-cities" aria-label={copy.services[1]}>
            <li><AboutIcon name="pin" /><p>{lang === "ar" ? "الرباط" : "Rabat"}</p><span lang={lang === "ar" ? "fr" : "ar"}>{lang === "ar" ? "Rabat" : "الرباط"}</span></li>
            <li><AboutIcon name="pin" /><p>{lang === "ar" ? "سلا" : "Salé"}</p><span lang={lang === "ar" ? "fr" : "ar"}>{lang === "ar" ? "Salé" : "سلا"}</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function AboutIcon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {name === "box" && <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8M12 13v9M7 5.8l9 5" /></>}
      {name === "pin" && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
      {name === "wallet" && <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 15h2M7 5V3h11" /></>}
      {name === "bottles" && <><path d="M5 3h4v5l2 3v10H3V11l2-3V3ZM5 6h4M15 8h6v13h-6zM16 5h4M16 12h4M5 14h4" /></>}
      {name === "tag" && <><path d="M3 3h8l10 10-8 8L3 11V3Z" /><circle cx="7.5" cy="7.5" r="1" /><path d="m12 11 4 4" /></>}
      {name === "cart" && <><path d="M3 3h2l3 12h11l3-9H6M8 15l-1 3h12" /><circle cx="9" cy="21" r="1" /><circle cx="18" cy="21" r="1" /></>}
      {name === "truck" && <><path d="M2 5h12v12H2V5ZM14 9h4l4 4v4h-8M2 17h3m12 0h-5" /><circle cx="7" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>}
    </svg>
  );
}
