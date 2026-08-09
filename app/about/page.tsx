import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { getLandingContent } from "@/lib/db";
import { loadCollections } from "@/lib/data";
import { getLandingCopy } from "@/lib/landing-copy";
import { getLanguage } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang).about;
  const [content, collections] = await Promise.all([getLandingContent(), loadCollections()]);
  const firstImage = content.aboutSection.image?.trim() || collections[0]?.image?.trim();
  const secondImage = collections.find((collection) => collection.image && collection.image !== firstImage)?.image;

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden border-b border-gold/[0.16] bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(214,179,90,0.1),transparent_38%)]" />
        <div className="storefront-container relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
          <div className="lg:col-span-6">
            <p className="storefront-eyebrow">
              <span className="h-px w-9 bg-gold" />
              {copy.eyebrow}
            </p>
            <h1 className="storefront-page-title mt-6 max-w-[14ch]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-[1.9] text-white/58 sm:text-base">
              {copy.description}
            </p>
            <Link href="/shop" className="btn-primary mt-8 h-12">
              {copy.cta}
            </Link>
          </div>

          <EditorialImage
            src={firstImage}
            alt={copy.storyTitle}
            label={copy.values[0].title}
            className="aspect-[4/5] lg:col-span-6 lg:aspect-[5/4]"
            priority
          />
        </div>
      </section>

      <section className="storefront-container storefront-section">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <p className="storefront-eyebrow">
              <span className="h-px w-9 bg-gold" />
              {copy.storyEyebrow}
            </p>
            <h2 className="storefront-section-title mt-5">
              {copy.storyTitle}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-[1.9] text-white/58 sm:text-[0.95rem]">
              {copy.storyDescription}
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-gold/[0.16] bg-gold/[0.16] sm:grid-cols-2 lg:col-span-7">
            {copy.values.map((value, index) => (
              <article key={value.title} className="min-h-52 bg-card p-7 sm:p-8 lg:p-10">
                <span className="font-display text-4xl text-gold/35">0{index + 1}</span>
                <h3 className="mt-8 font-display text-2xl text-white">{value.title}</h3>
                <p className="mt-3 text-sm leading-[1.8] text-white/58">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-gold/[0.16] bg-surface">
        <div className="storefront-container storefront-section">
          <div className="mb-10 max-w-3xl md:mb-14">
            <p className="storefront-eyebrow">
              <span className="h-px w-9 bg-gold" />
              {copy.valuesEyebrow}
            </p>
            <h2 className="storefront-section-title mt-5">
              {copy.valuesTitle}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
            <EditorialImage
              src={secondImage || firstImage}
              alt={copy.valuesTitle}
              label={copy.values[3].title}
              className="aspect-[4/3] lg:col-span-7 lg:aspect-auto lg:min-h-[470px]"
            />
            <div className="flex flex-col justify-between rounded-2xl border border-gold/[0.16] bg-card p-7 sm:p-9 lg:col-span-5 lg:p-11">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-gold">MONADATY</p>
                <p className="mt-6 font-display text-3xl leading-[1.15] text-white sm:text-4xl">
                  {copy.closingTitle}
                </p>
                <p className="mt-5 text-sm leading-[1.85] text-white/58">{copy.closingDescription}</p>
              </div>
              <Link href="/shop" className="btn-primary mt-10 h-12 w-full sm:w-fit">
                {copy.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="storefront-container py-16 text-center md:py-20 lg:py-24">
        <p className="storefront-section-title mx-auto max-w-[18ch]">
          {copy.closingTitle}
        </p>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-[1.85] text-white/58">{copy.closingDescription}</p>
        <Link href="/shop" className="btn-primary mt-8 h-12">{copy.cta}</Link>
      </section>
    </div>
  );
}

function EditorialImage({
  src,
  alt,
  label,
  className,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  label: string;
  className: string;
  priority?: boolean;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-gold/[0.16] bg-card ${className}`}>
      {src ? (
        <SafeImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          fallback={null}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(214,179,90,0.11),transparent_58%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <p className="absolute bottom-6 start-6 text-[0.56rem] font-semibold uppercase tracking-[0.3em] text-gold sm:bottom-8 sm:start-8">
        {label}
      </p>
    </div>
  );
}
