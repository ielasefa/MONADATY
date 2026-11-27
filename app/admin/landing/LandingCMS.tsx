"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { landingAdminCopy } from "@/lib/landing-admin-copy";
import { IconBox, IconLayers } from "@/components/admin/dashboard/icons";

export type HomepageProduct = { id: string; name: string; image: string; price: string };
export type HomepageCollection = { id: string; name: string; image: string };
type Props = {
  configId?: string;
  products: HomepageProduct[];
  initialProductIds: string[];
  collections?: HomepageCollection[];
  initialCollectionIds?: string[];
  published?: boolean;
};

export function LandingCMS({ configId, products, initialProductIds, collections = [], initialCollectionIds = [], published = true }: Props) {
  const { lang } = useTranslation("admin");
  const labels = landingAdminCopy[lang];
  const router = useRouter();
  const [productIds, setProductIds] = useState(() => Array.from({ length: 4 }, (_, i) => initialProductIds[i] || ""));
  // The storefront renders three collection tiles. Existing extra saved IDs are
  // left alone unless the administrator explicitly changes this selection.
  const [collectionIds, setCollectionIds] = useState(() => Array.from({ length: 3 }, (_, i) => initialCollectionIds[i] || ""));
  const [savedProducts, setSavedProducts] = useState(() => productIds.join(","));
  const [savedCollections, setSavedCollections] = useState(() => collectionIds.join(","));
  const [isPublished, setIsPublished] = useState(published);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const productDirty = productIds.join(",") !== savedProducts;
  const collectionDirty = collectionIds.join(",") !== savedCollections;
  const dirty = productDirty || collectionDirty;
  const count = productIds.filter(id => products.some(product => product.id === id)).length;
  const chosenCollections = collectionIds.filter(Boolean);
  const collectionValid = !configId || collections.length === 0 || (chosenCollections.length > 0
    && new Set(chosenCollections).size === chosenCollections.length
    && chosenCollections.every(id => collections.some(collection => collection.id === id)));
  const valid = count === 4 && new Set(productIds).size === 4 && collectionValid;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function request(url: string, method: string, body: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || "SAVE_FAILED");
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!valid) { setFeedback({ error: true, text: collectionValid ? labels.invalid : labels.invalidCollections }); return; }
    setSaving(true);
    setFeedback(null);
    try {
      if (productDirty) {
        await request("/api/admin/landing/featured-products", "PUT", { productIds });
      }
      if (configId && collectionDirty) {
        await request("/api/admin/landing/sections", "PUT", {
          configId, sectionType: "collections", data: { selectedCollectionIds: collectionIds.filter(Boolean).join(",") },
        });
      }
      if (configId) await request("/api/admin/landing/publish", "POST", { configId });
      setSavedProducts(productIds.join(","));
      const compactCollections = Array.from({ length: 3 }, (_, i) => chosenCollections[i] || "");
      setCollectionIds(compactCollections);
      setSavedCollections(compactCollections.join(","));
      setIsPublished(true);
      setFeedback({ error: false, text: labels.saved });
      router.refresh();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setFeedback({ error: true, text: code === "PRODUCTS_UNAVAILABLE" ? labels.unavailableError : code === "SAVE_CONFLICT" ? labels.conflict : labels.failed });
    } finally {
      setSaving(false);
    }
  }

  function chooseProduct(index: number, id: string) {
    setProductIds(previous => previous.map((value, i) => i === index ? id : value));
    setFeedback(null);
  }

  return (
    <div className="container-shell homepage-admin">
      <header className="homepage-admin-heading">
        <div><h1>{labels.title}</h1><p>{labels.description}</p></div>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary">{labels.view}<span aria-hidden="true">↗</span></Link>
      </header>
      <form onSubmit={save} aria-busy={saving}>
        <section className="admin-panel homepage-admin-panel" aria-labelledby="homepage-products-title">
          <div className="homepage-admin-panel-heading">
            <span className="homepage-admin-section-icon"><IconBox className="h-5 w-5" /></span>
            <div><h2 id="homepage-products-title">{labels.products}</h2><p>{labels.productsDescription}</p></div>
            <span className="homepage-admin-count" aria-live="polite">{count} / 4</span>
          </div>
          {products.length === 0 && <p className="homepage-admin-empty">{labels.empty} <Link href="/admin/products">{labels.manage}</Link></p>}
          <div className="homepage-admin-products">
            {productIds.map((id, index) => {
              const product = products.find(item => item.id === id);
              return (
                <div key={index} className="homepage-admin-slot">
                  <label htmlFor={`homepage-product-${index}`}>{labels.position} {index + 1}</label>
                  <SelectionImage key={product?.image || id || index} image={product?.image} name={product?.name} />
                  <select id={`homepage-product-${index}`} name={`product-${index}`} value={id} disabled={saving} className="admin-input" onChange={event => chooseProduct(index, event.target.value)}>
                    <option value="">{labels.chooseProduct}</option>
                    {id && !product && <option value={id} disabled>{labels.unavailable}</option>}
                    {products.map(item => <option key={item.id} value={item.id} disabled={item.id !== id && productIds.includes(item.id)}>{item.name}</option>)}
                  </select>
                  <p className="homepage-admin-product-price">{product?.price || "—"}</p>
                </div>
              );
            })}
          </div>
        </section>
        {configId && collections.length > 0 && <section className="admin-panel homepage-admin-panel" aria-labelledby="homepage-collections-title">
          <div className="homepage-admin-panel-heading">
            <span className="homepage-admin-section-icon"><IconLayers className="h-5 w-5" /></span>
            <div><h2 id="homepage-collections-title">{labels.collections}</h2><p>{labels.collectionsDescription}</p></div>
            <span className="homepage-admin-count">{collectionIds.filter(Boolean).length} / 3</span>
          </div>
          <div className="homepage-admin-collections">
            {collectionIds.map((id, index) => {
              const collection = collections.find(item => item.id === id);
              return <div key={index} className="homepage-admin-collection-slot">
                <SelectionImage key={collection?.image || id || index} image={collection?.image} name={collection?.name} collection />
                <div><label htmlFor={`homepage-collection-${index}`}>{labels.position} {index + 1}</label>
                  <select id={`homepage-collection-${index}`} name={`collection-${index}`} value={id} disabled={saving} className="admin-input" onChange={event => {
                    const value = event.target.value;
                    setCollectionIds(previous => previous.map((old, i) => i === index ? value : old));
                    setFeedback(null);
                  }}>
                    <option value="">{labels.chooseCollection}</option>
                    {collections.map(item => <option key={item.id} value={item.id} disabled={item.id !== id && collectionIds.includes(item.id)}>{item.name}</option>)}
                  </select>
                </div>
              </div>;
            })}
          </div>
        </section>}
        <p className="homepage-admin-fixed"><IconLayers className="h-4 w-4" />{labels.fixed}</p>
        {feedback && <p role={feedback.error ? "alert" : "status"} className={`homepage-admin-feedback ${feedback.error ? "homepage-admin-feedback-error" : ""}`}>{feedback.text}</p>}
        <footer className="homepage-admin-savebar">
          <p aria-live="polite">{dirty || !isPublished || !valid ? labels.pending : labels.ready}</p>
          <button type="submit" disabled={saving || !valid || (!dirty && isPublished)} className="btn-primary">{saving ? labels.saving : labels.save}</button>
        </footer>
      </form>
    </div>
  );
}

function SelectionImage({ image, name, collection = false }: { image?: string; name?: string; collection?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <div className={`homepage-admin-image ${collection ? "homepage-admin-image-collection" : ""}`}>
    {image && !failed ? <Image src={image} alt={name || ""} fill sizes={collection ? "64px" : "180px"} className={collection ? "object-cover" : "object-contain p-3"} onError={() => setFailed(true)} /> : <IconBox className="h-7 w-7" />}
  </div>;
}
