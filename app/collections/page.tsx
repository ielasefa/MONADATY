import Link from "next/link";
import { CollectionArtwork } from "@/components/CollectionArtwork";
import { loadCollections, loadProducts } from "@/lib/data";
import { getLanguage } from "@/lib/translations";
import { getLandingCopy } from "@/lib/landing-copy";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang);
  const [collections, products] = await Promise.all([loadCollections(), loadProducts()]);
  const counts = Object.fromEntries(
    collections.map((collection) => [
      collection.slug,
      products.filter((product) => product.collection === collection.slug).length,
    ]),
  );

  const preferred = ["cappy-collection", "hawai-collection", "coca-cola-collection"];
  const ordered = [
    ...preferred.map((slug) => collections.find((collection) => collection.slug === slug)),
    ...collections,
  ].filter((collection, index, list) =>
    Boolean(collection) && list.findIndex((candidate) => candidate?.slug === collection?.slug) === index,
  );
  const showcase = ordered.slice(0, 3).filter(Boolean) as typeof collections;
  const [largeCollection, ...smallCollections] = showcase;

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden border-b border-gold/[0.16] bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(214,179,90,0.09),transparent_38%)]" />
        <div className="storefront-container storefront-section relative">
          <Reveal>
          <p className="storefront-eyebrow">
            <span className="h-px w-9 bg-gold" />
            {copy.collections.eyebrow}
          </p>
          <div className="mt-6 grid gap-7 lg:grid-cols-12 lg:items-end">
            <h1 className="storefront-page-title lg:col-span-8">
              {copy.collections.title}
            </h1>
            <p className="max-w-xl text-sm leading-[1.85] text-white/58 lg:col-span-4 lg:justify-self-end">
              {copy.collections.description}
            </p>
          </div>
          </Reveal>
        </div>
      </section>

      <section className="storefront-container storefront-section">
        {largeCollection ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12" dir="ltr">
            <Reveal className="md:col-span-7" delay={0.04}>
              <CollectionTile
                collection={largeCollection}
                count={counts[largeCollection.slug] ?? 0}
                label={copy.collections.label}
                action={copy.collections.explore}
                className="h-[430px] md:h-[600px]"
                sizes="(min-width: 768px) 58vw, 100vw"
                prominent
              />
            </Reveal>

            <div className="grid gap-6 md:col-span-5 md:grid-rows-2">
              {smallCollections.map((collection, index) => (
                <Reveal key={collection.slug} delay={0.1 + index * 0.07} className="h-full">
                  <CollectionTile
                    collection={collection}
                    count={counts[collection.slug] ?? 0}
                    label={copy.collections.label}
                    action={copy.collections.explore}
                    className="h-[290px] md:h-full"
                    sizes="(min-width: 768px) 42vw, 100vw"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="storefront-empty">
            <p className="storefront-eyebrow justify-center">{copy.collections.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl text-white">{copy.collections.empty}</h2>
            <Link href="/shop" className="btn-primary mt-7">{copy.featured.cta}</Link>
          </div>
        )}
      </section>
    </div>
  );
}

type Collection = Awaited<ReturnType<typeof loadCollections>>[number];

function CollectionTile({
  collection,
  count,
  label,
  action,
  className,
  sizes,
  prominent = false,
}: {
  collection: Collection;
  count: number;
  label: string;
  action: string;
  className: string;
  sizes: string;
  prominent?: boolean;
}) {
  return (
    <Link
      href={`/shop?collection=${collection.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-gold/[0.16] bg-card text-start shadow-[0_24px_70px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/30 ${className}`}
    >
      <CollectionArtwork
        image={collection.image}
        title={collection.title}
        accent={collection.accent}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        monogramSize={prominent ? "text-[10rem]" : "text-[7rem]"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-black/15 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10" dir="auto">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-gold">
          {label} · {String(count).padStart(2, "0")}
        </p>
        <h2 className={`mt-3 max-w-[16ch] translate-y-1 font-display leading-[0.94] tracking-[-0.025em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none ${prominent ? "text-4xl sm:text-5xl" : "text-3xl"}`}>
          {collection.title}
        </h2>
        {collection.description && prominent && (
          <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-[1.75] text-white/58">
            {collection.description}
          </p>
        )}
        <span aria-hidden="true" className="mt-5 block h-px w-12 origin-left scale-x-1/2 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transform-none motion-reduce:transition-none rtl:origin-right" />
        <span className="mt-4 inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/65 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-gold-light motion-reduce:transform-none rtl:group-hover:-translate-x-1">
          {action} <span aria-hidden="true" className="rtl:rotate-180">→</span>
        </span>
      </div>
    </Link>
  );
}
