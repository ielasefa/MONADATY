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
          <div className="mt-2.5 max-w-3xl">
            <h1 className="storefront-page-title">
              {copy.collections.title}
            </h1>
            <p className="mt-2.5 max-w-[68ch] text-base leading-[1.65] text-secondary">
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
      className={`group relative block overflow-hidden rounded-2xl border border-line bg-[#450407] text-start shadow-[var(--market-shadow)] transition-all duration-500 hover:-translate-y-1 hover:border-[#d6b35a]/50 ${className}`}
    >
      <CollectionArtwork
        image={collection.image}
        title={collection.title}
        accent={collection.accent}
        sizes={sizes}
        className="absolute inset-0 scale-[1.08] object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.12] motion-reduce:transition-none motion-reduce:scale-100"
        monogramSize={prominent ? "text-[10rem]" : "text-[7rem]"}
      />
      <span aria-hidden="true" className="collection-tile-shade absolute inset-0" />
      <div className={prominent ? "collection-tile-caption-overlay absolute inset-x-0 bottom-0" : "collection-tile-caption-overlay collection-tile-caption-compact absolute inset-x-0 bottom-0"} dir="auto">
        <p className="collection-tile-label-overlay">
          {label} · {String(count).padStart(2, "0")}
        </p>
        <h2 className={prominent ? "collection-tile-title-overlay collection-tile-title-large-overlay" : "collection-tile-title-overlay"}>
          {collection.title}
        </h2>
        {collection.description && prominent && (
          <p className="collection-tile-description-overlay">
            {collection.description}
          </p>
        )}
        <span className={prominent ? "collection-tile-action-overlay" : "collection-tile-action-overlay collection-tile-action-icon-overlay"}>
          {prominent && action}<span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
