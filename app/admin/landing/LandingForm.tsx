"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteSettings, StoredTestimonial } from "@/types";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type FeaturedEntry = {
  id: string;
  position: number;
  enabled: boolean;
  productId: string;
  product: { id: string; name: string; slug: string; price: string; image: string } | null;
};

type CollectionEntry = {
  id: string;
  name: string;
  slug: string;
  image: string;
  landingEnabled: boolean;
  landingOrder: number;
};

type Props = {
  settings: SiteSettings;
  testimonials: StoredTestimonial[];
  featuredEntries: FeaturedEntry[];
  allCollections: CollectionEntry[];
  updateSettings: (formData: FormData) => void;
  updateSectionOrder: (formData: FormData) => void;
  saveFeaturedProducts: (formData: FormData) => void;
  updateFeaturedProduct: (formData: FormData) => void;
  deleteFeaturedProduct: (formData: FormData) => void;
  saveTestimonial: (formData: FormData) => void;
  deleteTestimonial: (formData: FormData) => void;
  updateCollectionLanding: (formData: FormData) => void;
};

function toDraft(s: SiteSettings) {
  return {
    hero: { ...s.hero },
    featuredProducts: { ...s.featuredProducts },
    collectionsSection: { ...s.collectionsSection },
    aboutSection: { ...s.aboutSection },
    testimonialsSection: { ...s.testimonialsSection },
    announcementBar: { ...s.announcementBar },
    newsletter: { ...s.newsletter },
  };
}

export function LandingForm({
  settings, testimonials, featuredEntries, allCollections,
  updateSettings, updateSectionOrder, saveFeaturedProducts, updateFeaturedProduct, deleteFeaturedProduct,
  saveTestimonial, deleteTestimonial, updateCollectionLanding,
}: Props) {
  const { t } = useTranslation("admin");
  const [activeTab, setActiveTab] = useState(0);
  const TABS_KEYS = [
    t("section_order") || "Section Order",
    t("hero"), t("featured_products"), t("collections_section"),
    t("about"), t("testimonials"),
    t("announcement_bar") || "Announcement Bar", t("newsletter") || "Newsletter",
    t("footer"),
  ];
  const [draft, setDraft] = useState(() => toDraft(settings));
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => [...settings.sectionOrder]);
  const [draftTestimonials, setDraftTestimonials] = useState(() => [...testimonials]);
  const [draftCollections, setDraftCollections] = useState(() => [...allCollections]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: string; image: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setDraft(toDraft(settings));
    setSectionOrder([...settings.sectionOrder]);
    setDraftTestimonials([...testimonials]);
    setDraftCollections([...allCollections]);
  }, [settings, testimonials, allCollections]);

  const patchDraft = useCallback(<K extends keyof ReturnType<typeof toDraft>>(section: K, patch: Partial<ReturnType<typeof toDraft>[K]>) => {
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }, []);

  const handleSave = useCallback(async (formData: FormData) => {
    await updateSettings(formData);
  }, [updateSettings]);

  const handleSaveTestimonial = useCallback(async (formData: FormData) => {
    const id = formData.get("id") as string;
    const name = (formData.get("name") as string) || "";
    const role = (formData.get("role") as string) || "";
    const content = (formData.get("content") as string) || "";
    const visible = formData.get("visible") !== "false";
    const order = parseInt(formData.get("order") as string) || 0;

    if (id) {
      setDraftTestimonials((prev) => prev.map((t) => t.id === id ? { ...t, name, role, content, visible, order } : t));
    } else {
      setDraftTestimonials((prev) => [...prev, { id: crypto.randomUUID(), name, role, content, avatar: "", visible, order }]);
    }
    await saveTestimonial(formData);
  }, [saveTestimonial]);

  const handleDeleteTestimonial = useCallback(async (formData: FormData) => {
    const id = formData.get("id") as string;
    setDraftTestimonials((prev) => prev.filter((t) => t.id !== id));
    await deleteTestimonial(formData);
  }, [deleteTestimonial]);

  const handleSearchProducts = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/products/picker?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.products || []);
      }
    } catch { /* ignore */ }
    setIsSearching(false);
  }, []);

  const handleAddFeaturedProduct = useCallback(async (productId: string) => {
    const formData = new FormData();
    const currentIds = featuredEntries.map((e) => e.productId).filter(Boolean);
    currentIds.push(productId);
    formData.set("productIds", currentIds.join(","));
    await saveFeaturedProducts(formData);
    setSearchQuery("");
    setSearchResults([]);
  }, [featuredEntries, saveFeaturedProducts]);

  const handleRemoveFeaturedProduct = useCallback(async (entryId: string) => {
    const formData = new FormData();
    formData.set("id", entryId);
    await deleteFeaturedProduct(formData);
  }, [deleteFeaturedProduct]);

  const handleToggleFeaturedProduct = useCallback(async (entryId: string, enabled: boolean) => {
    const entry = featuredEntries.find((e) => e.id === entryId);
    if (!entry) return;
    const formData = new FormData();
    formData.set("id", entryId);
    formData.set("enabled", String(enabled));
    formData.set("position", String(entry.position));
    await updateFeaturedProduct(formData);
  }, [featuredEntries, updateFeaturedProduct]);

  const handleMoveFeaturedProduct = useCallback(async (entryId: string, direction: "up" | "down") => {
    const idx = featuredEntries.findIndex((e) => e.id === entryId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= featuredEntries.length) return;
    const a = featuredEntries[idx];
    const b = featuredEntries[swapIdx];
    const formA = new FormData();
    formA.set("id", a.id);
    formA.set("enabled", String(a.enabled));
    formA.set("position", String(swapIdx));
    await updateFeaturedProduct(formA);
    const formB = new FormData();
    formB.set("id", b.id);
    formB.set("enabled", String(b.enabled));
    formB.set("position", String(idx));
    await updateFeaturedProduct(formB);
  }, [featuredEntries, updateFeaturedProduct]);

  const handleMoveSection = useCallback(async (idx: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setSectionOrder(newOrder);
    const formData = new FormData();
    formData.set("order", newOrder.join(","));
    await updateSectionOrder(formData);
  }, [sectionOrder, updateSectionOrder]);

  const handleToggleCollectionLanding = useCallback(async (collectionId: string, enabled: boolean) => {
    const col = draftCollections.find((c) => c.id === collectionId);
    if (!col) return;
    setDraftCollections((prev) => prev.map((c) => c.id === collectionId ? { ...c, landingEnabled: enabled } : c));
    const formData = new FormData();
    formData.set("id", collectionId);
    formData.set("landingEnabled", String(enabled));
    formData.set("landingOrder", String(col.landingOrder));
    await updateCollectionLanding(formData);
  }, [draftCollections, updateCollectionLanding]);

  const handleMoveCollection = useCallback(async (collectionId: string, direction: "up" | "down") => {
    const enabledCols = draftCollections.filter((c) => c.landingEnabled);
    const idx = enabledCols.findIndex((c) => c.id === collectionId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= enabledCols.length) return;
    const a = enabledCols[idx];
    const b = enabledCols[swapIdx];
    const formA = new FormData();
    formA.set("id", a.id);
    formA.set("landingEnabled", "true");
    formA.set("landingOrder", String(swapIdx));
    await updateCollectionLanding(formA);
    const formB = new FormData();
    formB.set("id", b.id);
    formB.set("landingEnabled", "true");
    formB.set("landingOrder", String(idx));
    await updateCollectionLanding(formB);
    setDraftCollections((prev) => prev.map((c) => {
      if (c.id === a.id) return { ...c, landingOrder: swapIdx };
      if (c.id === b.id) return { ...c, landingOrder: idx };
      return c;
    }));
  }, [draftCollections, updateCollectionLanding]);

  const enabledCollections = draftCollections.filter((c) => c.landingEnabled).sort((a, b) => a.landingOrder - b.landingOrder);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">{t("pages")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("landing_page")}</h1>
          <p className="mt-1 text-sm text-muted">{t("manage_homepage")}</p>
        </div>
        <a href="/" target="_blank" className="btn-gold">{t("view_live_site")}</a>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          <div className="mb-8 flex flex-wrap gap-1 border-b border-white/[0.06]">
            {TABS_KEYS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 text-sm transition border-b-2 font-medium ${
                  i === activeTab ? "border-red text-white" : "border-transparent text-muted hover:text-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 0 && (
            <SectionOrderForm sectionOrder={sectionOrder} onMove={handleMoveSection} />
          )}
          {activeTab === 1 && (
            <HeroForm hero={draft.hero} onChange={(patch) => patchDraft("hero", patch)} onSave={handleSave} />
          )}
          {activeTab === 2 && (
            <FeaturedForm
              featured={draft.featuredProducts}
              onChange={(patch) => patchDraft("featuredProducts", patch)}
              onSave={handleSave}
              featuredEntries={featuredEntries}
              searchQuery={searchQuery}
              searchResults={searchResults}
              isSearching={isSearching}
              onSearch={handleSearchProducts}
              onAddProduct={handleAddFeaturedProduct}
              onRemoveProduct={handleRemoveFeaturedProduct}
              onToggleProduct={handleToggleFeaturedProduct}
              onMoveProduct={handleMoveFeaturedProduct}
            />
          )}
          {activeTab === 3 && (
            <CollectionsSectionForm
              section={draft.collectionsSection}
              onChange={(patch) => patchDraft("collectionsSection", patch)}
              onSave={handleSave}
              allCollections={draftCollections}
              enabledCollections={enabledCollections}
              onToggleCollection={handleToggleCollectionLanding}
              onMoveCollection={handleMoveCollection}
            />
          )}
          {activeTab === 4 && (
            <AboutForm about={draft.aboutSection} onChange={(patch) => patchDraft("aboutSection", patch)} onSave={handleSave} />
          )}
          {activeTab === 5 && (
            <TestimonialsSectionForm
              section={draft.testimonialsSection}
              onChange={(patch) => patchDraft("testimonialsSection", patch)}
              onSave={handleSave}
              testimonials={draftTestimonials}
              onSaveTestimonial={handleSaveTestimonial}
              onDeleteTestimonial={handleDeleteTestimonial}
            />
          )}
          {activeTab === 6 && (
            <AnnouncementBarForm announcement={draft.announcementBar} onChange={(patch) => patchDraft("announcementBar", patch)} onSave={handleSave} />
          )}
          {activeTab === 7 && (
            <NewsletterForm newsletter={draft.newsletter} onChange={(patch) => patchDraft("newsletter", patch)} onSave={handleSave} />
          )}
          {activeTab === 8 && (
            <FooterForm footer={settings.footer} onSave={handleSave} />
          )}
        </div>

        <div className="hidden xl:block w-[480px] shrink-0">
          <PreviewPanel draft={draft} featuredEntries={featuredEntries} testimonials={draftTestimonials} />
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="luxury-card p-8">
      <h2 className="luxury-label mb-6">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, name, defaultValue, value, onChange, type = "text", rows, placeholder }: { label: string; name: string; defaultValue?: string; value?: string; onChange?: (val: string) => void; type?: string; rows?: number; placeholder?: string }) {
  const id = `field-${name}`;
  const isControlled = value !== undefined;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="luxury-label">{label}</label>
      {rows ? (
        <textarea id={id} name={name} defaultValue={!isControlled ? defaultValue : undefined} value={isControlled ? value : undefined} onChange={isControlled ? (e) => onChange?.(e.target.value) : undefined} rows={rows} className="input-premium w-full px-4 py-3 min-h-[96px] resize-y" />
      ) : (
        <input id={id} name={name} type={type} placeholder={placeholder} defaultValue={!isControlled ? defaultValue : undefined} value={isControlled ? value : undefined} onChange={isControlled ? (e) => onChange?.(e.target.value) : undefined} className="input-premium w-full px-4 py-2.5" />
      )}
    </div>
  );
}

function Toggle({ name, checked, onChange, label }: { name: string; checked?: boolean; onChange?: (v: boolean) => void; label: string }) {
  const isControlled = checked !== undefined;
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={!isControlled ? checked : undefined} checked={isControlled ? checked : undefined} onChange={isControlled ? (e) => onChange?.(e.target.checked) : undefined} value="true" className="h-4 w-4 rounded border-white/20 accent-red" />
      <span className="text-sm text-muted">{label}</span>
    </label>
  );
}

async function submitForm(e: React.FormEvent<HTMLFormElement>, action: (d: FormData) => void, extra?: Record<string, string>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      formData.set(key, value);
    }
  }
  await action(formData);
}

const SECTION_LABELS: Record<string, string> = {
  announcement: "Announcement Bar",
  hero: "Hero",
  featured: "Featured Products",
  collections: "Collections",
  about: "Our Story",
  testimonials: "Testimonials",
  newsletter: "Newsletter",
};

function SectionOrderForm({ sectionOrder, onMove }: { sectionOrder: string[]; onMove: (idx: number, dir: "up" | "down") => void }) {
  return (
    <SectionCard title="Section Order">
      <p className="text-sm text-muted mb-4">Drag sections up or down to reorder how they appear on the homepage. All sections here are always rendered if enabled.</p>
      <div className="space-y-2">
        {sectionOrder.map((key, idx) => (
          <div key={key} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface p-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-medium text-muted">{idx + 1}</span>
            <span className="flex-1 text-sm font-medium text-white">{SECTION_LABELS[key] || key}</span>
            <button type="button" onClick={() => onMove(idx, "up")} disabled={idx === 0} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8593;</button>
            <button type="button" onClick={() => onMove(idx, "down")} disabled={idx === sectionOrder.length - 1} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8595;</button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function HeroForm({ hero, onChange, onSave }: { hero: SiteSettings["hero"]; onChange: (p: Partial<SiteSettings["hero"]>) => void; onSave: (d: FormData) => void }) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("hero_section")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "hero", enabled: String(hero.enabled), title: hero.title, subtitle: hero.subtitle, description: hero.description, ctaText: hero.ctaText, ctaLink: hero.ctaLink })} className="space-y-5">
        <Toggle name="enabled" checked={hero.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_hero") || "Enable hero section"} />
        <Input label={t("title")} name="title" value={hero.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("subtitle")} name="subtitle" value={hero.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <Input label={t("description")} name="description" value={hero.description} onChange={(v) => onChange({ description: v })} rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t("cta_button_text")} name="ctaText" value={hero.ctaText} onChange={(v) => onChange({ ctaText: v })} />
          <Input label={t("cta_link")} name="ctaLink" value={hero.ctaLink} onChange={(v) => onChange({ ctaLink: v })} />
        </div>
        <div className="space-y-2">
          <label className="luxury-label">{t("hero_image") || "Hero Image"}</label>
          <SingleImageUploader label={t("hero_image") || "Hero Image"} value={hero.media?.[0] || ""} onChange={(url) => onChange({ media: url ? [url] : [] })} folder="monadaty/hero" />
          <input type="hidden" name="heroImage" defaultValue={hero.media?.[0] || ""} />
        </div>
        <button type="submit" className="btn-primary mt-2">{t("save_hero")}</button>
      </form>
    </SectionCard>
  );
}

function FeaturedForm({ featured, onChange, onSave, featuredEntries, searchQuery, searchResults, isSearching, onSearch, onAddProduct, onRemoveProduct, onToggleProduct, onMoveProduct }: {
  featured: SiteSettings["featuredProducts"];
  onChange: (p: Partial<SiteSettings["featuredProducts"]>) => void;
  onSave: (d: FormData) => void;
  featuredEntries: FeaturedEntry[];
  searchQuery: string;
  searchResults: Array<{ id: string; name: string; price: string; image: string }>;
  isSearching: boolean;
  onSearch: (q: string) => void;
  onAddProduct: (productId: string) => void;
  onRemoveProduct: (entryId: string) => void;
  onToggleProduct: (entryId: string, enabled: boolean) => void;
  onMoveProduct: (entryId: string, direction: "up" | "down") => void;
}) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("featured_products")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "featured", enabled: String(featured.enabled), title: featured.title, subtitle: featured.subtitle })} className="space-y-5">
        <Toggle name="enabled" checked={featured.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_featured")} />
        <Input label={t("section_title")} name="title" value={featured.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("section_subtitle")} name="subtitle" value={featured.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>

      <div className="mt-8 border-t border-white/[0.06] pt-8">
        <h3 className="luxury-label mb-4">Select Products</h3>
        <div className="relative mb-4">
          <input type="text" value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="Search products by name..." className="input-premium w-full px-4 py-2.5" />
          {isSearching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">Searching...</span>}
          {searchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-white/[0.06] bg-surface shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((p) => (
                <button key={p.id} type="button" onClick={() => onAddProduct(p.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted overflow-hidden">
                    {p.image ? <SafeImage src={p.image} alt={p.name} fill className="object-cover" sizes="40px" /> : "IMG"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{p.name}</p>
                    <p className="text-xs text-muted">{p.price}</p>
                  </div>
                  <span className="badge-emerald text-xs">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {featuredEntries.length === 0 && (
            <p className="text-sm text-muted py-4 text-center">No featured products selected. Search and add products above.</p>
          )}
          {featuredEntries.map((entry, idx) => (
            <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface p-3">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted overflow-hidden">
                {entry.product?.image ? (
                  <SafeImage src={entry.product.image} alt={entry.product.name} fill className="object-cover" sizes="48px" />
                ) : "IMG"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{entry.product?.name || "Unknown product"}</p>
                <p className="text-xs text-muted">{entry.product?.price}</p>
              </div>
              <span className="text-xs text-muted mr-1">#{entry.position}</span>
              <button type="button" onClick={() => onMoveProduct(entry.id, "up")} disabled={idx === 0} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8593;</button>
              <button type="button" onClick={() => onMoveProduct(entry.id, "down")} disabled={idx === featuredEntries.length - 1} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8595;</button>
              <button type="button" onClick={() => onToggleProduct(entry.id, !entry.enabled)} className={`p-1 transition-colors ${entry.enabled ? "text-emerald" : "text-muted hover:text-white"}`}>
                {entry.enabled ? "\u25CF" : "\u25CB"}
              </button>
              <button type="button" onClick={() => onRemoveProduct(entry.id)} className="p-1 text-red/60 hover:text-red transition-colors">{"\u2715"}</button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function CollectionsSectionForm({ section, onChange, onSave, allCollections, enabledCollections, onToggleCollection, onMoveCollection }: {
  section: SiteSettings["collectionsSection"];
  onChange: (p: Partial<SiteSettings["collectionsSection"]>) => void;
  onSave: (d: FormData) => void;
  allCollections: CollectionEntry[];
  enabledCollections: CollectionEntry[];
  onToggleCollection: (id: string, enabled: boolean) => void;
  onMoveCollection: (id: string, direction: "up" | "down") => void;
}) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("collections_section")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "collections", enabled: String(section.enabled), title: section.title, subtitle: section.subtitle })} className="space-y-5">
        <Toggle name="enabled" checked={section.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_collections")} />
        <Input label={t("section_title")} name="title" value={section.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("section_subtitle")} name="subtitle" value={section.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>

      <div className="mt-8 border-t border-white/[0.06] pt-8">
        <h3 className="luxury-label mb-2">Select Collections</h3>
        <p className="text-sm text-muted mb-4">Toggle collections to show on the homepage. Use arrows to reorder.</p>

        {enabledCollections.length > 0 && (
          <div className="space-y-2 mb-6">
            {enabledCollections.map((col, idx) => (
              <div key={col.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface p-3">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted overflow-hidden">
                  {col.image ? <SafeImage src={col.image} alt={col.name} fill className="object-cover" sizes="40px" /> : col.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{col.name}</p>
                </div>
                <span className="text-xs text-muted mr-1">#{col.landingOrder}</span>
                <button type="button" onClick={() => onMoveCollection(col.id, "up")} disabled={idx === 0} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8593;</button>
                <button type="button" onClick={() => onMoveCollection(col.id, "down")} disabled={idx === enabledCollections.length - 1} className="p-1 text-muted hover:text-white disabled:opacity-30 transition-colors">&#8595;</button>
                <button type="button" onClick={() => onToggleCollection(col.id, false)} className="p-1 text-red/60 hover:text-red transition-colors">{"\u2715"}</button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {allCollections.filter((c) => !c.landingEnabled).map((col) => (
            <div key={col.id} className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.06] bg-surface/50 p-3 opacity-60">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-xs text-muted overflow-hidden">
                {col.image ? <SafeImage src={col.image} alt={col.name} fill className="object-cover" sizes="40px" /> : col.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/70 truncate">{col.name}</p>
              </div>
              <button type="button" onClick={() => onToggleCollection(col.id, true)} className="badge-emerald text-xs">Show</button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function AboutForm({ about, onChange, onSave }: { about: SiteSettings["aboutSection"]; onChange: (p: Partial<SiteSettings["aboutSection"]>) => void; onSave: (d: FormData) => void }) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("about_section")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "about", enabled: String(about.enabled), title: about.title, subtitle: about.subtitle, description: about.description, image: about.image })} className="space-y-5">
        <Toggle name="enabled" checked={about.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_about")} />
        <Input label={t("title")} name="title" value={about.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("subtitle")} name="subtitle" value={about.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <Input label={t("description")} name="description" value={about.description} onChange={(v) => onChange({ description: v })} rows={4} />
        <SingleImageUploader label={t("about_image")} value={about.image} onChange={(url) => onChange({ image: url })} folder="monadaty/about" />
        <input type="hidden" name="image" defaultValue={about.image} />
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>
    </SectionCard>
  );
}

function TestimonialsSectionForm({ section, onChange, onSave, testimonials, onSaveTestimonial, onDeleteTestimonial }: {
  section: SiteSettings["testimonialsSection"];
  onChange: (p: Partial<SiteSettings["testimonialsSection"]>) => void;
  onSave: (d: FormData) => void;
  testimonials: StoredTestimonial[];
  onSaveTestimonial: (d: FormData) => void;
  onDeleteTestimonial: (d: FormData) => void;
}) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("testimonials")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "testimonials", enabled: String(section.enabled), title: section.title, subtitle: section.subtitle })} className="space-y-5 mb-8">
        <Toggle name="enabled" checked={section.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_testimonials") || "Enable testimonials section"} />
        <Input label={t("section_title") || "Title"} name="title" value={section.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("section_subtitle") || "Subtitle"} name="subtitle" value={section.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>

      <div className="border-t border-white/[0.06] pt-8">
        <h3 className="luxury-label mb-4">Manage Testimonials</h3>
        <div className="space-y-5">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="rounded-[16px] border border-white/[0.06] bg-surface p-5">
              <form onSubmit={(e) => { e.preventDefault(); onDeleteTestimonial(new FormData(e.currentTarget)); }} className="mb-3 flex justify-end">
                <input type="hidden" name="id" value={testimonial.id} />
                <button type="submit" className="badge-red">{t("delete")}</button>
              </form>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("id", testimonial.id); onSaveTestimonial(fd); }} className="grid grid-cols-2 gap-4">
                <Input label={t("name")} name="name" defaultValue={testimonial.name} />
                <Input label={t("role")} name="role" defaultValue={testimonial.role} />
                <div className="col-span-2"><Input label={t("content")} name="content" defaultValue={testimonial.content} rows={2} /></div>
                <Input label={t("order")} name="order" defaultValue={String(testimonial.order)} type="number" />
                <label className="flex items-center gap-2 text-sm text-muted pt-6">
                  <input type="hidden" name="visible" value="false" />
                  <input type="checkbox" name="visible" defaultChecked={testimonial.visible} value="true" className="h-4 w-4 rounded border-white/20 accent-red" />
                  {t("visible")}
                </label>
                <button type="submit" className="btn-primary">{t("update")}</button>
              </form>
            </div>
          ))}
          <details className="rounded-[16px] border border-dashed border-white/[0.06] p-5">
            <summary className="cursor-pointer text-sm font-medium text-gold">{t("add_testimonial")}</summary>
            <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); fd.set("visible", "true"); onSaveTestimonial(fd); }} className="mt-4 grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <Input label={t("name")} name="name" />
                <Input label={t("role")} name="role" />
              </div>
              <div className="col-span-2"><Input label={t("content")} name="content" rows={2} /></div>
              <Input label={t("order")} name="order" type="number" />
              <button type="submit" className="col-span-2 btn-primary">{t("add_testimonial")}</button>
            </form>
          </details>
        </div>
      </div>
    </SectionCard>
  );
}

function AnnouncementBarForm({ announcement, onChange, onSave }: { announcement: SiteSettings["announcementBar"]; onChange: (p: Partial<SiteSettings["announcementBar"]>) => void; onSave: (d: FormData) => void }) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("announcement_bar") || "Announcement Bar"}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "announcement", enabled: String(announcement.enabled), text: announcement.text, link: announcement.link, buttonText: announcement.buttonText, bgColor: announcement.bgColor, textColor: announcement.textColor })} className="space-y-5">
        <Toggle name="enabled" checked={announcement.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_announcement") || "Enable announcement bar"} />
        <Input label={t("announcement_text") || "Text"} name="text" value={announcement.text} onChange={(v) => onChange({ text: v })} />
        <Input label={t("announcement_link") || "URL"} name="link" value={announcement.link} onChange={(v) => onChange({ link: v })} />
        <Input label={t("button_text") || "Button Text"} name="buttonText" value={announcement.buttonText} onChange={(v) => onChange({ buttonText: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t("bg_color") || "Background Color"} name="bgColor" value={announcement.bgColor} onChange={(v) => onChange({ bgColor: v })} placeholder="#D5B87D or rgba(213,184,125,0.1)" />
          <Input label={t("text_color") || "Text Color"} name="textColor" value={announcement.textColor} onChange={(v) => onChange({ textColor: v })} placeholder="#D5B87D" />
        </div>
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>
    </SectionCard>
  );
}

function NewsletterForm({ newsletter, onChange, onSave }: { newsletter: SiteSettings["newsletter"]; onChange: (p: Partial<SiteSettings["newsletter"]>) => void; onSave: (d: FormData) => void }) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("newsletter") || "Newsletter"}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "newsletter", enabled: String(newsletter.enabled), title: newsletter.title, subtitle: newsletter.subtitle, description: newsletter.description, placeholder: newsletter.placeholder, buttonText: newsletter.buttonText })} className="space-y-5">
        <Toggle name="enabled" checked={newsletter.enabled} onChange={(v) => onChange({ enabled: v })} label={t("enable_newsletter") || "Enable newsletter section"} />
        <Input label={t("section_title") || "Title"} name="title" value={newsletter.title} onChange={(v) => onChange({ title: v })} />
        <Input label={t("section_subtitle") || "Subtitle"} name="subtitle" value={newsletter.subtitle} onChange={(v) => onChange({ subtitle: v })} />
        <Input label={t("description") || "Description"} name="description" value={newsletter.description} onChange={(v) => onChange({ description: v })} rows={2} />
        <Input label={t("placeholder") || "Placeholder"} name="placeholder" value={newsletter.placeholder} onChange={(v) => onChange({ placeholder: v })} />
        <Input label={t("button_text") || "Button Text"} name="buttonText" value={newsletter.buttonText} onChange={(v) => onChange({ buttonText: v })} />
        <button type="submit" className="btn-primary mt-2">{t("save")}</button>
      </form>
    </SectionCard>
  );
}

function FooterForm({ footer, onSave }: { footer: SiteSettings["footer"]; onSave: (d: FormData) => void }) {
  const { t } = useTranslation("admin");
  return (
    <SectionCard title={t("footer")}>
      <form onSubmit={(e) => submitForm(e, onSave, { section: "footer", footerDescription: footer.description, copyright: footer.copyright, footerEmail: footer.email, footerPhone: footer.phone, footerAddress: footer.address })} className="space-y-5">
        <Input label={t("description")} name="footerDescription" defaultValue={footer.description} rows={3} />
        <Input label={t("copyright")} name="copyright" defaultValue={footer.copyright} />
        <div className="grid grid-cols-2 gap-4">
          <Input label={t("email")} name="footerEmail" defaultValue={footer.email} />
          <Input label={t("phone")} name="footerPhone" defaultValue={footer.phone} />
        </div>
        <Input label={t("address")} name="footerAddress" defaultValue={footer.address} />
        <button type="submit" className="btn-primary mt-2">{t("save_footer")}</button>
      </form>
    </SectionCard>
  );
}

function PreviewPanel({ draft, featuredEntries, testimonials }: {
  draft: ReturnType<typeof toDraft>;
  featuredEntries: FeaturedEntry[];
  testimonials: StoredTestimonial[];
}) {
  const { t } = useTranslation("admin");
  const enabledFeatured = featuredEntries.filter((e) => e.enabled);
  const visibleTestimonials = testimonials.filter((t) => t.visible);
  return (
    <div className="sticky top-6 luxury-card overflow-hidden">
      <div className="border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
        <span className="luxury-label text-[0.65rem]">{t("live_preview")}</span>
        <span className="badge-emerald">{t("auto_update")}</span>
      </div>
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="p-6 space-y-10">
          {draft.hero.enabled && (
            <div className="relative overflow-hidden rounded-card bg-white/5 px-6 py-8 shadow-sm border border-white/[0.06]">
              <Hero settings={{ ...draft.hero, media: draft.hero.media || [] }} />
            </div>
          )}

          {draft.featuredProducts.enabled && enabledFeatured.length > 0 && (
            <PreviewSection title={draft.featuredProducts.title}>
              <div className="grid grid-cols-3 gap-4">
                {enabledFeatured.map((entry) => (
                  <div key={entry.id} className="rounded-card bg-white/10 p-4 shadow-sm border border-white/[0.08]">
                    <div className="aspect-square rounded-[16px] bg-gradient-to-br from-white/10 to-white/10 flex items-center justify-center overflow-hidden">
                      {entry.product?.image ? (
                        <SafeImage src={entry.product.image} alt={entry.product.name} fill className="object-cover" sizes="120px" />
                      ) : (
                        <span className="text-4xl font-semibold tracking-[0.2em] text-gold/40">MD</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-center text-[#1C1C1B]/45 uppercase tracking-wider truncate">{entry.product?.name || "Product"}</p>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {draft.collectionsSection.enabled && (
            <PreviewSection title={draft.collectionsSection.title}>
              <div className="rounded-card bg-white/10 p-4 shadow-sm border border-white/[0.06]">
                <p className="text-xs text-[#1C1C1B]/60 text-center">{t("collections_section")}</p>
              </div>
            </PreviewSection>
          )}

          {draft.aboutSection.enabled && (
            <PreviewSection title={draft.aboutSection.title}>
              <div className="rounded-card bg-white/10 p-4 shadow-sm border border-white/[0.08]">
                <p className="text-xs text-[#1C1C1B]/60 leading-relaxed line-clamp-3">{draft.aboutSection.description || "About description"}</p>
              </div>
            </PreviewSection>
          )}

          {draft.testimonialsSection.enabled && visibleTestimonials.length > 0 && (
            <PreviewSection title={draft.testimonialsSection.title}>
              <div className="space-y-3">
                {visibleTestimonials.map((t) => (
                  <div key={t.id} className="rounded-card bg-white/10 p-4 shadow-sm border border-white/[0.08]">
                    <p className="text-xs text-[#1C1C1B]/70 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                    <p className="mt-2 text-xs font-medium text-[#1C1C1B]">{t.name}</p>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {draft.newsletter.enabled && (
            <PreviewSection title={draft.newsletter.title}>
              <div className="rounded-card bg-white/10 p-4 shadow-sm border border-white/[0.08] text-center">
                <p className="text-[0.65rem] text-[#1C1C1B]/60">{draft.newsletter.placeholder || "Email input"}</p>
              </div>
            </PreviewSection>
          )}

          <div className="divider-gold pt-4">
            <Footer settings={{ description: "", copyright: "", email: "", phone: "", address: "" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold text-center">{title}</p>
      {children}
    </section>
  );
}
