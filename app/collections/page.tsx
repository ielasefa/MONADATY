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

  const ordered = [...collections].sort((a, b) => Number(counts[b.slug] > 0) - Number(counts[a.slug] > 0));
  const showcase = ordered.slice(0, 3);
  const [largeCollection, ...smallCollections] = showcase;

  return (
    <div className="collection-page bg-canvas">
      <section className="relative overflow-hidden border-b border-line bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(214,179,90,0.09),transparent_38%)]" />
        <div className="storefront-container collection-intro relative">
          <Reveal>
          <p className="storefront-eyebrow">
            <span className="h-px w-9 bg-gold" />
            {copy.collections.eyebrow}
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-12 lg:items-end">
            <h1 className="storefront-page-title lg:col-span-8">
              {copy.collections.title}
            </h1>
            <p className="max-w-xl text-sm leading-[1.85] text-secondary lg:col-span-4 lg:justify-self-end">
              {copy.collections.description}
            </p>
          </div>
          </Reveal>
        </div>
      </section>

      <section className="storefront-container collection-content">
        {largeCollection ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            <Reveal className="md:col-span-7" delay={0.04}>
              <CollectionTile
                collection={largeCollection}
                count={counts[largeCollection.slug] ?? 0}
                label={copy.collections.label}
                action={copy.collections.explore}
                className="h-72 md:h-[440px]"
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
                    className="h-56 md:h-full"
                    sizes="(min-width: 768px) 42vw, 100vw"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="storefront-empty">
            <p className="storefront-eyebrow justify-center">{copy.collections.eyebrow}</p>
            <h2 className="mt-4 font-display text-3xl text-foreground">{copy.collections.empty}</h2>
            <Link href="/shop" className="btn-primary mt-7">{copy.featured.cta}</Link>
          </div>
        )}
        {ordered.length > 3 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ordered.slice(3).map((collection) => (
              <CollectionTile
                key={collection.slug}
                collection={collection}
                count={counts[collection.slug] ?? 0}
                label={copy.collections.label}
                action={copy.collections.explore}
                className="h-56"
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw"
              />
            ))}
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
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card text-start shadow-[var(--market-shadow)] transition-all duration-500 hover:-translate-y-1 hover:border-line ${className}`}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
      <CollectionArtwork
        image={collection.image}
        title={collection.title}
        accent={collection.accent}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        monogramSize={prominent ? "text-[10rem]" : "text-[7rem]"}
      />
      </div>
      <div className="market-image-caption market-collection-caption relative shrink-0 text-foreground" dir="auto">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">
          {label} · {String(count).padStart(2, "0")}
        </p>
        <h2 className={`mt-3 max-w-[16ch] translate-y-1 font-display leading-[0.94] tracking-[-0.025em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none ${prominent ? "text-4xl sm:text-5xl" : "text-3xl"}`}>
          {collection.title}
        </h2>
        {collection.description && prominent && (
          <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-[1.75] text-secondary">
            {collection.description}
          </p>
        )}
        <span aria-hidden="true" className="mt-5 block h-px w-12 origin-left scale-x-1/2 bg-gold transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transform-none motion-reduce:transition-none rtl:origin-right" />
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-secondary transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent motion-reduce:transform-none rtl:group-hover:-translate-x-1">
          {action} <span aria-hidden="true" className="rtl:rotate-180">→</span>
        </span>
      </div>
    </Link>
  );
}
