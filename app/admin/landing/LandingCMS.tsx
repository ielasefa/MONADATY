"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Reorder } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import type { LandingPageData } from "@/lib/landing-cms";
import { SafeImage } from "@/components/SafeImage";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";

type FeaturedEntry = {
  id: string; position: number; enabled: boolean;
  productId: string; product: { id: string; name: string; slug: string; price: string; image: string } | null;
};

type CollectionEntry = {
  id: string; name: string; slug: string; image: string;
  landingEnabled: boolean; landingOrder: number;
};

type VersionInfo = {
  id: string; version: number; status: string; label: string;
  createdBy: string; createdAt: string;
};

type Props = {
  configId: string;
  landingData: LandingPageData;
  featuredEntries: FeaturedEntry[];
  allCollections: CollectionEntry[];
  versions: VersionInfo[];
};

const SECTION_LABELS: Record<string, string> = {
  hero: "section_hero",
  featured: "section_featured",
  collections: "section_collections",
  about: "section_about",
  testimonials: "section_testimonials",
  moroccan_moment: "section_moroccan_moment",
  newsletter: "section_newsletter",
  final_cta: "section_final_cta",
  seo: "section_seo",
};

const SECTION_ICONS: Record<string, string> = {
  hero: "◇", featured: "□", collections: "⊞", about: "△",
  testimonials: "♢", moroccan_moment: "◎", newsletter: "✉", final_cta: "▶", seo: "⚙",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Shape the opening message, imagery, and calls to action.",
  featured: "Choose and order the products highlighted on the homepage.",
  collections: "Manage the collection heading and the collections customers see.",
  about: "Present the MONADATY story and supporting brand imagery.",
  testimonials: "Control the heading and visibility of customer proof.",
  moroccan_moment: "Edit the lifestyle story, imagery, and supporting action.",
  newsletter: "Configure the newsletter invitation and form copy.",
  final_cta: "Refine the final conversion message and destination.",
  seo: "Set search and social sharing metadata for the landing page.",
};

function Input({ label, name, value, onChange, type = "text", rows, placeholder, maxLength }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; rows?: number; placeholder?: string; maxLength?: number;
}) {
  const id = `cms-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50">{label}</label>
      {rows ? (
        <textarea id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} maxLength={maxLength} placeholder={placeholder} className="input-premium min-h-[96px] w-full resize-y py-3 leading-relaxed" />
      ) : (
        <input id={id} name={name} type={type} value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} placeholder={placeholder} className="input-premium w-full" />
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 ${checked ? "bg-burgundy" : "bg-white/20"}`}
      >
        <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      </button>
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );
}

function ImageField({ label, value, onChange, folder }: { label: string; value: string; onChange: (v: string) => void; folder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50">{label}</label>
      <SingleImageUploader
        label=""
        value={value}
        onChange={onChange}
        folder={folder || "monadaty/landing"}
        className="max-w-2xl [&_img]:h-56 [&>div]:max-h-64"
      />
    </div>
  );
}

function SectionCard({ title, icon, children, badge }: {
  title: string; icon?: string; children: React.ReactNode; badge?: React.ReactNode;
}) {
  return (
    <section className="space-y-6 rounded-xl border border-white/[0.07] bg-[#121211] p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] sm:p-6 lg:p-7">
      <div className="-mx-5 flex items-center justify-between border-b border-white/[0.06] px-5 pb-5 sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7">
        <div className="flex items-center gap-3">
          {icon && <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/10 text-[0.7rem] text-gold">{icon}</span>}
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-white/90">{title}</h3>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

type DraftData = Record<string, Record<string, unknown>>;

function initDraft(landingData: LandingPageData): DraftData {
  const draft: DraftData = {};
  for (const key of ["hero", "brandStory", "featured", "collectionHeader", "testimonialHeader", "moroccanMoment", "finalCta", "newsletter"] as const) {
    const val = landingData[key];
    if (val) draft[key] = { ...val as Record<string, unknown> };
  }
  draft.seo = landingData.seo ? { ...landingData.seo as unknown as Record<string, unknown> } : { title: "", metaDescription: "", ogTitle: "", ogDescription: "", ogImage: "", canonicalUrl: "" };
  return draft;
}

async function apiPut(url: string, body: unknown) {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed" })); throw new Error(err.error || "Failed"); }
  return res.json();
}

async function apiPost(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: "Failed" })); throw new Error(err.error || "Failed"); }
  return res.json();
}

const SECTION_TYPE_MAP: Record<string, string> = {
  hero: "hero", brandStory: "about", featured: "featured", collectionHeader: "collections",
  testimonialHeader: "testimonials", moroccanMoment: "moroccanMoment", finalCta: "finalCta", newsletter: "newsletter",
};

export function LandingCMS({ configId, landingData, featuredEntries, allCollections, versions }: Props) {
  const { t } = useTranslation("admin");
  const [draft, setDraft] = useState<DraftData>(() => initDraft(landingData));
  const [order, setOrder] = useState<string[]>(() => [...landingData.sectionOrder]);
  const [activeSection, setActiveSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [status, setStatus] = useState(landingData.status);
  const [publishedAt, setPublishedAt] = useState(landingData.publishedAt);
  const [unsaved, setUnsaved] = useState(false);
  const [localFeaturedEntries, setLocalFeaturedEntries] = useState<FeaturedEntry[]>(() => [...featuredEntries]);
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState("");
  const [featuredSearchResults, setFeaturedSearchResults] = useState<Array<{ id: string; name: string; price: string; image: string; slug: string; category?: { name: string } }>>([]);
  const [featuredShowAdd, setFeaturedShowAdd] = useState(false);

  const initialCollectionIds = ((landingData.collectionHeader as Record<string, unknown>)?.selectedCollectionIds as string || "").split(",").filter(Boolean);
  const [localSelectedCollectionIds, setLocalSelectedCollectionIds] = useState<string[]>(() => [...initialCollectionIds]);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState("");
  const [collectionSearchResults, setCollectionSearchResults] = useState<Array<{ id: string; name: string; slug: string; image: string }>>([]);
  const [collectionShowAdd, setCollectionShowAdd] = useState(false);

  const lastSavedRef = useRef<ReturnType<typeof setTimeout>>(undefined);


  const markUnsaved = useCallback(() => {
    setUnsaved(true);
    if (lastSavedRef.current) clearTimeout(lastSavedRef.current);
  }, []);

  const patchDraft = useCallback((section: string, data: Record<string, unknown>) => {
    setDraft((prev) => ({ ...prev, [section]: { ...prev[section], ...data } }));
    markUnsaved();
  }, [markUnsaved]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      for (const [dbKey, sectionType] of Object.entries(SECTION_TYPE_MAP)) {
        const data = draft[dbKey];
        if (!data) continue;
        
        const sectionDataToSave = { ...data, configId: undefined, id: undefined };
        if (sectionType === "featured") {
          (sectionDataToSave as any).productIds = localFeaturedEntries.map(e => e.productId).filter(Boolean).join(",");
        }
        if (sectionType === "collections") {
          (sectionDataToSave as any).selectedCollectionIds = localSelectedCollectionIds.filter(Boolean).join(",");
        }
        
        await apiPut("/api/admin/landing/sections", { configId, sectionType, data: sectionDataToSave });
      }
      await apiPut("/api/admin/landing/order", { configId, order });
      if (draft.seo) await apiPut("/api/admin/landing/seo", { configId, ...draft.seo });
      setStatus("draft");
      setUnsaved(false);
      toast.success(t("landing_draft_saved", "Draft saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("landing_failed_save", "Failed to save"));
    }
    setSaving(false);
  }, [configId, draft, order, localFeaturedEntries, localSelectedCollectionIds, t]);

   const handlePublish = useCallback(async () => {
      setPublishing(true);
      try {
        await handleSave();
        await apiPost("/api/admin/landing/publish", { configId });
        setStatus("published");
        setPublishedAt(new Date().toISOString());
        toast.success(t("landing_published_toast", "Landing page published successfully"));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("landing_failed_publish", "Failed to publish"));
      }
      setPublishing(false);
    }, [configId, handleSave, t]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  // Handle unsaved changes warning before unload
  useEffect(() => {
    if (!unsaved) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t("landing_unsaved_changes_warning", "You have unsaved changes. Leave anyway?");
      return t("landing_unsaved_changes_warning", "You have unsaved changes. Leave anyway?");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsaved, t]);

  const handleReorderSections = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    markUnsaved();
  }, [markUnsaved]);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-w-0 overflow-hidden bg-[#0B0B0A]">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="flex w-14 shrink-0 flex-col border-e border-white/[0.06] bg-[#121211] xl:w-52">
        <div className="border-b border-white/[0.06] px-3 py-4 xl:px-4">
          <div className="flex items-center justify-between">
            <div className="hidden xl:block">
              <p className="text-[0.55rem] font-medium uppercase tracking-[0.15em] text-white/30">{t("landing_page", "Landing Page")}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${status === "published" ? "bg-emerald-400" : "bg-gold animate-pulse"}`} />
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-white/50">{status}</span>
              </div>
            </div>
            {publishedAt && <span className="hidden text-[0.5rem] text-white/25 xl:inline">{(new Date(publishedAt)).toLocaleDateString()}</span>}
            <span className={`mx-auto h-2 w-2 rounded-full xl:hidden ${status === "published" ? "bg-emerald-400" : "bg-gold"}`} aria-label={status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <p className="mb-2 hidden px-2 text-[0.5rem] font-medium uppercase tracking-[0.15em] text-white/20 xl:block">{t("landing_sections", "Sections")}</p>
          <Reorder.Group axis="y" values={order} onReorder={handleReorderSections} className="space-y-0.5">
            {order.map((key) => {
              const sectionKey = key;
              const displayLabel = t(SECTION_LABELS[sectionKey] || sectionKey, SECTION_LABELS[sectionKey] || sectionKey);
              const icon = SECTION_ICONS[sectionKey] || "•";
              return (
                <Reorder.Item key={sectionKey} value={sectionKey} className="cursor-grab active:cursor-grabbing">
                  <button
                    onClick={() => setActiveSection(sectionKey)}
                    title={displayLabel}
                    className={`flex min-h-10 w-full items-center justify-center gap-2.5 rounded-md px-2 py-2 text-start text-sm transition-all duration-150 xl:justify-start xl:px-3 ${
                      activeSection === sectionKey
                        ? "border-s-[3px] border-burgundy bg-burgundy/15 text-white"
                        : "border-s-[3px] border-transparent text-white/40 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="text-[0.7rem]">{icon}</span>
                    <span className="hidden flex-1 truncate text-[0.7rem] xl:block">{displayLabel}</span>
                    <span className="hidden text-[0.5rem] text-white/20 xl:block">⋮⋮</span>
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        <div className="space-y-2 border-t border-white/[0.06] p-3">
          <div className="flex items-center justify-center xl:justify-between">
            <span className="hidden text-[0.5rem] font-medium uppercase tracking-[0.1em] text-white/25 xl:inline">{versions.length} versions</span>
            <button onClick={() => setShowVersions(true)} title={t("history_label", "History")} className="flex h-9 w-9 items-center justify-center rounded-md text-sm text-gold transition-colors hover:bg-gold/10 hover:text-gold-light xl:h-auto xl:w-auto xl:text-[0.6rem]">↶<span className="hidden xl:ms-1 xl:inline">{t("history_label", "History")}</span></button>
          </div>
          <div className="hidden text-[0.5rem] text-white/20 xl:block">{t("landing_ctrl_s", "Ctrl+S to save")}</div>
        </div>
      </aside>

      {/* ── EDITOR PANEL ── */}
      <main className="flex min-w-0 flex-1 flex-col bg-[#0B0B0A]">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0B0B0A] px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-8 w-1 shrink-0 rounded-full bg-gradient-to-b from-gold via-gold/50 to-transparent" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-white">{t(SECTION_LABELS[activeSection] || activeSection, SECTION_LABELS[activeSection] || activeSection)}</h1>
              <p className="mt-0.5 hidden max-w-2xl truncate text-xs text-white/40 md:block">{SECTION_DESCRIPTIONS[activeSection] || t("landing_section_editor", "Section Editor")}</p>
            </div>
            {unsaved && <span className="shrink-0 rounded-full bg-gold/10 px-2.5 py-1 text-[0.55rem] font-medium uppercase tracking-[0.12em] text-gold animate-pulse">{t("landing_unsaved", "Unsaved")}</span>}
          </div>
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0">
            <span className={`hidden rounded-full border px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.14em] sm:inline-flex ${status === "published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-gold/20 bg-gold/5 text-gold"}`}>
              <span className={`me-1.5 inline-block h-1.5 w-1.5 rounded-full ${status === "published" ? "bg-emerald-400" : "bg-gold"}`} />
              {status === "published" ? t("landing_published", "Published") : t("landing_draft", "Draft")}
            </span>
            <button onClick={handleSave} disabled={saving} className="btn-primary-sm h-9 px-4 text-[0.55rem] max-sm:w-full">{saving ? t("landing_saving", "Saving...") : t("landing_save_draft", "Save Draft")}</button>
            <button onClick={handlePublish} disabled={publishing || saving} className="btn-gold h-9 px-5 text-[0.55rem] max-sm:w-full">{publishing ? t("landing_publishing", "Publishing...") : t("landing_publish", "Publish")}</button>
            <a href="/" target="_blank" rel="noreferrer" className="btn-secondary h-9 px-4 text-[0.55rem] max-sm:!hidden sm:!inline-flex">{t("landing_view_site", "View Site")}</a>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {activeSection === "hero" && draft.hero && <HeroEditor data={draft.hero} onChange={(d) => patchDraft("hero", d)} />}
          {activeSection === "about" && draft.brandStory && <BrandStoryEditor data={draft.brandStory} onChange={(d) => patchDraft("brandStory", d)} />}
          {activeSection === "featured" && draft.featured && <FeaturedEditor data={draft.featured} onChange={(d) => patchDraft("featured", d)} localFeaturedEntries={localFeaturedEntries} setLocalFeaturedEntries={setLocalFeaturedEntries} initialFeaturedEntries={featuredEntries} configId={configId} markUnsaved={markUnsaved} searchQuery={featuredSearchQuery} setSearchQuery={setFeaturedSearchQuery} searchResults={featuredSearchResults} setSearchResults={setFeaturedSearchResults} showAdd={featuredShowAdd} setShowAdd={setFeaturedShowAdd} />}
          {activeSection === "collections" && draft.collectionHeader && <CollectionsEditor configId={configId} data={draft.collectionHeader} onChange={(d) => patchDraft("collectionHeader", d)} allCollections={allCollections} localSelectedCollectionIds={localSelectedCollectionIds} setLocalSelectedCollectionIds={setLocalSelectedCollectionIds} initialSelectedCollectionIds={initialCollectionIds} markUnsaved={markUnsaved} searchQuery={collectionSearchQuery} setSearchQuery={setCollectionSearchQuery} searchResults={collectionSearchResults} setSearchResults={setCollectionSearchResults} showAdd={collectionShowAdd} setShowAdd={setCollectionShowAdd} />}
          {activeSection === "testimonials" && draft.testimonialHeader && <TestimonialsEditor data={draft.testimonialHeader} onChange={(d) => patchDraft("testimonialHeader", d)} />}
          {activeSection === "moroccan_moment" && draft.moroccanMoment && <MoroccanMomentEditor data={draft.moroccanMoment} onChange={(d) => patchDraft("moroccanMoment", d)} />}
          {activeSection === "newsletter" && draft.newsletter && <NewsletterEditor data={draft.newsletter} onChange={(d) => patchDraft("newsletter", d)} />}
          {activeSection === "final_cta" && draft.finalCta && <FinalCtaEditor data={draft.finalCta} onChange={(d) => patchDraft("finalCta", d)} />}
          {activeSection === "seo" && draft.seo && <SeoEditor data={draft.seo as Record<string, string>} onChange={(d) => patchDraft("seo", d)} />}
        </div>
      </main>

      {/* ── VERSION HISTORY MODAL ── */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVersions(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#171717] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h3 className="text-sm font-medium text-white">{t("landing_version_history", "Version History")}</h3>
              <button onClick={() => setShowVersions(false)} className="text-white/40 hover:text-white text-lg">&times;</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {versions.length === 0 && <p className="text-sm text-white/40 text-center py-8">{t("landing_no_versions", "No versions saved yet")}</p>}
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-surface/50 px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">v{v.version}</span>
                      <span className={`text-[0.5rem] font-medium uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${v.status === "published" ? "bg-emerald-400/10 text-emerald-400" : "bg-gold/10 text-gold"}`}>{v.status}</span>
                    </div>
                    <p className="text-[0.65rem] text-white/35 mt-0.5">{v.label} — by {v.createdBy}</p>
                    <p className="text-[0.55rem] text-white/20">{new Date(v.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await apiPost("/api/admin/landing/versions/restore", { configId, versionId: v.id });
                        toast.success(t("landing_restore_success", "Restored v{version}").replace("{version}", String(v.version)));
                        setTimeout(() => window.location.reload(), 1000);
                      } catch { toast.error(t("landing_restore_failed", "Failed to restore")); }
                    }}
                    className="btn-primary-sm h-7 px-3 text-[0.5rem]"
                  >{t("landing_restore", "Restore")}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTION EDITORS
   ═══════════════════════════════════════════════ */

function patchLayout(data: Record<string, unknown>, patch: Record<string, unknown>) {
  return { ...data, layout: { ...(data.layout as Record<string, unknown> || {}), ...patch } };
}

function SectionSettings({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  const layout = (data.layout || {}) as Record<string, unknown>;
  const patch = (patch: Record<string, unknown>) => onChange(patchLayout(data, patch));
  return (
    <SectionCard title={t("section_settings", "Section Settings")} icon="⚙">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("background", "Background")}</label>
          <select value={(layout.bgVariant as string) || "default"} onChange={(e) => patch({ bgVariant: e.target.value })} className="input-premium w-full">
            <option value="default">{t("bg_default", "Default")}</option>
            <option value="surface">{t("bg_surface", "Surface")}</option>
            <option value="burgundy">{t("bg_burgundy", "Burgundy")}</option>
            <option value="burgundy-dark">{t("bg_burgundy_dark", "Dark Burgundy")}</option>
            <option value="custom">{t("bg_custom", "Custom")}</option>
          </select>
          {(layout.bgVariant as string) === "custom" && (
            <div className="mt-2">
              <Input label="" name="customBg" value={(layout.customBg as string) || ""} onChange={(v) => patch({ customBg: v })} placeholder="#171717" />
            </div>
          )}
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("max_width", "Max Width")}</label>
          <select value={(layout.maxWidth as string) || "1400"} onChange={(e) => patch({ maxWidth: e.target.value })} className="input-premium w-full">
            <option value="1400">{t("mw_standard", "Standard (1400px)")}</option>
            <option value="1600">{t("mw_wide", "Wide (1600px)")}</option>
            <option value="full">{t("mw_full", "Full Width")}</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("padding_top", "Padding Top")}</label>
          <select value={(layout.pt as string) || "16"} onChange={(e) => patch({ pt: e.target.value })} className="input-premium w-full">
            <option value="12">{t("padding_small", "Small (py-12)")}</option>
            <option value="16">{t("padding_medium", "Medium (py-16)")}</option>
            <option value="20">{t("padding_large", "Large (py-20)")}</option>
            <option value="24">{t("padding_xl", "XL (py-24)")}</option>
            <option value="0">{t("padding_none", "None")}</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("padding_bottom", "Padding Bottom")}</label>
          <select value={(layout.pb as string) || "16"} onChange={(e) => patch({ pb: e.target.value })} className="input-premium w-full">
            <option value="12">{t("padding_small", "Small (py-12)")}</option>
            <option value="16">{t("padding_medium", "Medium (py-16)")}</option>
            <option value="20">{t("padding_large", "Large (py-20)")}</option>
            <option value="24">{t("padding_xl", "XL (py-24)")}</option>
            <option value="0">{t("padding_none", "None")}</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("border_radius", "Border Radius")}</label>
          <select value={(layout.radius as string) || "none"} onChange={(e) => patch({ radius: e.target.value })} className="input-premium w-full">
            <option value="none">{t("padding_none", "None")}</option>
            <option value="sm">{t("radius_small", "Small")}</option>
            <option value="md">{t("radius_medium", "Medium")}</option>
            <option value="lg">{t("radius_large", "Large")}</option>
            <option value="xl">{t("radius_xl", "XL")}</option>
            <option value="2xl">{t("radius_2xl", "2XL")}</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("animation", "Animation")}</label>
          <select value={(layout.animation as string) || "fade-up"} onChange={(e) => patch({ animation: e.target.value })} className="input-premium w-full">
            <option value="none">{t("padding_none", "None")}</option>
            <option value="fade-up">{t("anim_fade_up", "Fade Up")}</option>
            <option value="fade-in">{t("anim_fade_in", "Fade In")}</option>
            <option value="scale-in">{t("anim_scale_in", "Scale In")}</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("content", "Content")} icon="◇">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("headline", "Headline")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_taste_redefined", "TASTE\nREDEFINED.")} />
          <Input label={t("subheadline", "Subheadline")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_premium_soda", "Premium Soda — Moroccan Craft")} />
        </div>
        <Input label={t("description", "Description")} name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={3} placeholder={t("ph_refined_soda", "A refined soda experience...")} />
        <ImageField label={t("background_image", "Background Image")} value={(data.media as string[])?.[0] || ""} onChange={(url) => onChange({ media: url ? [url] : [] })} folder="monadaty/hero" />
      </SectionCard>
      <SectionCard title={t("landing_primary_cta", "Primary CTA")} icon="▶">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="ctaText" value={(data.ctaText as string) || ""} onChange={(v) => onChange({ ctaText: v })} placeholder={t("ph_shop_monadaty", "Shop MONADATY")} />
          <Input label={t("button_link", "Button Link")} name="ctaLink" value={(data.ctaLink as string) || ""} onChange={(v) => onChange({ ctaLink: v })} placeholder="/shop" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("target", "Target")}</label>
            <select value={(data.ctaTarget as string) || "_self"} onChange={(e) => onChange({ ctaTarget: e.target.value })} className="input-premium w-full">
              <option value="_self">{t("same_tab", "Same tab")}</option>
              <option value="_blank">{t("new_tab", "New tab")}</option>
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("variant", "Variant")}</label>
            <select value={(data.ctaVariant as string) || "primary"} onChange={(e) => onChange({ ctaVariant: e.target.value })} className="input-premium w-full">
              <option value="primary">{t("primary_gold", "Primary (Gold)")}</option>
              <option value="secondary">{t("outline", "Outline")}</option>
              <option value="burgundy">{t("bg_burgundy", "Burgundy")}</option>
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">{t("alignment", "Alignment")}</label>
            <select value={(data.alignment as string) || "left"} onChange={(e) => onChange({ alignment: e.target.value })} className="input-premium w-full">
              <option value="left">{t("align_left", "Left")}</option>
              <option value="center">{t("align_center", "Center")}</option>
              <option value="right">{t("align_right", "Right")}</option>
            </select>
          </div>
        </div>
      </SectionCard>
      <SectionCard title={t("landing_secondary_cta", "Secondary CTA")} icon="◇">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="secondaryCtaText" value={(data.secondaryCtaText as string) || ""} onChange={(v) => onChange({ secondaryCtaText: v })} placeholder={t("ph_explore_collections", "EXPLORE COLLECTIONS")} />
          <Input label={t("button_link", "Button Link")} name="secondaryCtaLink" value={(data.secondaryCtaLink as string) || ""} onChange={(v) => onChange({ secondaryCtaLink: v })} placeholder="/collections" />
        </div>
      </SectionCard>
      <SectionCard title={t("landing_design", "Design")} icon="⚙">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("background_style", "Background Style")} name="background" value={(data.background as string) || ""} onChange={(v) => onChange({ background: v })} placeholder="#171717 or gradient..." />
          <Input label={t("overlay_opacity", "Overlay Opacity (0–1)")} name="overlayOpacity" value={String(data.overlayOpacity ?? 0)} onChange={(v) => onChange({ overlayOpacity: parseFloat(v) || 0 })} placeholder="0.0" />
        </div>
      </SectionCard>
    </div>
  );
}

function BrandStoryEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("content", "Content")} icon="△">
        <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_our_story", "Our Story")} />
        <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_born_morocco", "BORN IN MOROCCO")} />
        <Input label={t("description", "Description")} name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={5} placeholder={t("ph_born_casablanca", "MONADATY was born in Casablanca...")} />
        <ImageField label={t("image_label", "Image")} value={(data.image as string) || ""} onChange={(v) => onChange({ image: v })} folder="monadaty/about" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_discover_story", "DISCOVER OUR STORY")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/about" />
        </div>
      </SectionCard>
    </div>
  );
}
function FeaturedEditor({ data, localFeaturedEntries, setLocalFeaturedEntries, initialFeaturedEntries, configId, onChange, markUnsaved, searchQuery, setSearchQuery, searchResults, setSearchResults, showAdd, setShowAdd }: {
  data: Record<string, unknown>;
  localFeaturedEntries: FeaturedEntry[];
  setLocalFeaturedEntries: React.Dispatch<React.SetStateAction<FeaturedEntry[]>>;
  initialFeaturedEntries: FeaturedEntry[];
  configId: string;
  onChange: (d: Record<string, unknown>) => void;
  markUnsaved: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: Array<{ id: string; name: string; price: string; image: string; slug: string; category?: { name: string } }>;
  setSearchResults: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; price: string; image: string; slug: string; category?: { name: string } }>>>;
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation("admin");
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(localFeaturedEntries.map(e => e.productId)) !== JSON.stringify(initialFeaturedEntries.map(e => e.productId));
  const isMaxReached = localFeaturedEntries.length >= 4;

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/admin/products/picker?q=${encodeURIComponent(query)}`);
      if (res.ok) { const d = await res.json(); setSearchResults(d.products || []); }
    } catch { /* ignore */ }
  }, [setSearchQuery, setSearchResults]);

  const handleAdd = useCallback((product: { id: string; name: string; slug: string; price: string; image: string }) => {
    setLocalFeaturedEntries(prev => {
      if (prev.length >= 4) return prev;
      if (prev.some(e => e.productId === product.id)) {
        toast.info(t("landing.product_already_selected", "Product already selected."));
        return prev;
      }
      const newEntry: FeaturedEntry = {
        id: product.id,
        position: prev.length,
        enabled: true,
        productId: product.id,
        product: product
      };
      markUnsaved();
      return [...prev, newEntry];
    });
  }, [setLocalFeaturedEntries, markUnsaved, t]);

  const handleRemove = useCallback((productId: string) => {
    setLocalFeaturedEntries(prev => {
      markUnsaved();
      return prev.filter(e => e.productId !== productId);
    });
  }, [setLocalFeaturedEntries, markUnsaved]);

  const handleDragEnd = useCallback((newEntries: FeaturedEntry[]) => {
    setLocalFeaturedEntries(newEntries);
    markUnsaved();
  }, [setLocalFeaturedEntries, markUnsaved]);

  const handleSaveFeatured = async () => {
    setSaving(true);
    try {
      const productIds = localFeaturedEntries.map(e => e.productId).join(",");
      const res = await fetch("/api/admin/landing/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId, sectionType: "featured", data: { productIds } })
      });
      
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || t("landing_failed_save", "Failed to save"));
      
      toast.success(t("landing.featured_saved", "Featured products updated successfully."));
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("landing_error_saving", "Error saving"));
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalFeaturedEntries([...initialFeaturedEntries]);
    toast.info(t("landing.changes_discarded", "Changes discarded."));
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      
      <SectionCard title={t("landing_section_header", "Section Header")} icon="□">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_featured", "Featured")} />
          <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_selected_flavors", "SELECTED FLAVORS")} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_view_all", "VIEW ALL")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>

      <SectionCard title={t("products", "Products")} icon="⊞">
        <div className="mb-5 flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/90">{t("selected_products_count", "Selected Products")} <span className="ms-2 rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] font-medium tracking-wider text-gold">{localFeaturedEntries.length} / 4 {t("selected", "Selected")}</span></p>
            {isMaxReached && <p className="text-[0.6rem] text-burgundy mt-1">{t("max_4_featured", "Maximum 4 featured products.")}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDirty && (
              <button 
                type="button" 
                onClick={handleDiscard} 
                disabled={saving}
                className="btn-secondary h-10 px-4 text-[0.6rem] disabled:opacity-50"
              >
                {t("discard_changes", "Discard Changes")}
              </button>
            )}
            <button 
              type="button" 
              onClick={handleSaveFeatured} 
              disabled={!isDirty || saving}
              className="btn-primary flex h-10 items-center gap-2 px-4 text-[0.6rem] disabled:opacity-50"
            >
              {saving ? t("landing_saving", "Saving...") : t("save_featured_products", "Save Featured Products")}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button 
            type="button"
            onClick={() => setShowAdd(!showAdd)} 
            disabled={saving}
            className="btn-secondary h-10 w-full px-5 text-[0.65rem] disabled:opacity-50 sm:w-auto"
          >
            {showAdd ? t("close_search", "Close Search") : t("search_add_products", "Search & Add Products")}
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 border-y border-white/[0.06] py-4">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => handleSearch(e.target.value)} 
              placeholder={t("landing_search_products", "Search products by name, SKU, or category...")} 
              className="input-premium w-full mb-3 bg-surface" 
            />
            {searchResults.length > 0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto pe-2">
                {searchResults.map((p) => {
                  const isSelected = localFeaturedEntries.some(e => e.productId === p.id);
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-black/25 p-2.5 transition-colors hover:border-white/[0.1] sm:gap-4">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5">
                        {p.image ? <SafeImage src={p.image} alt={p.name} fill className="object-cover" sizes="40px" /> : <span className="text-[0.5rem] text-white/30">{t("img", "IMG")}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[0.6rem] text-gold">{p.price}</p>
                          {p.category && <span className="text-[0.55rem] text-white/40 uppercase tracking-wider">• {p.category.name}</span>}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleAdd(p)} 
                        disabled={isSelected || (isMaxReached && !isSelected) || saving}
                        className={`inline-flex h-9 min-w-[72px] items-center justify-center rounded px-3 text-center text-[0.6rem] font-medium uppercase transition-all duration-200 ${
                          isSelected 
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                            : "bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                        }`}
                      >
                        {isSelected ? "✔ Selected" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[0.55rem] text-white/30 uppercase tracking-[0.1em] mb-2 px-1">{t("selected_order_drag", "Selected Order (Drag to reorder)")}</p>
          {localFeaturedEntries.length > 0 ? (
            <Reorder.Group axis="y" values={localFeaturedEntries} onReorder={handleDragEnd} className="space-y-2">
              {localFeaturedEntries.map((entry) => (
                <Reorder.Item key={entry.id} value={entry} className="cursor-grab active:cursor-grabbing">
                  <div className={`flex min-h-[72px] items-center gap-3 rounded-lg border ${saving ? 'opacity-50' : ''} border-white/[0.08] bg-black/20 p-3 transition-colors hover:border-gold/30 sm:gap-4`}>
                    <div className="text-white/20 hover:text-white/40 cursor-grab px-1">
                      <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><path d="M4 4C4 5.10457 3.10457 6 2 6C0.89543 6 0 5.10457 0 4C0 2.89543 0.89543 2 2 2C3.10457 2 4 2.89543 4 4ZM4 10C4 11.1046 3.10457 12 2 12C0.89543 12 0 11.1046 0 10C0 8.89543 0.89543 8 2 8C3.10457 8 4 8.89543 4 10ZM4 16C4 17.1046 3.10457 18 2 18C0.89543 18 0 17.1046 0 16C0 14.8954 0.89543 14 2 14C3.10457 14 4 14.8954 4 16ZM12 4C12 5.10457 11.1046 6 10 6C8.89543 6 8 5.10457 8 4C8 2.89543 8.89543 2 10 2C11.1046 2 12 2.89543 12 4ZM12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10ZM12 16C12 17.1046 11.1046 18 10 18C8.89543 18 8 17.1046 8 16C8 14.8954 8.89543 14 10 14C11.1046 14 12 14.8954 12 16Z"/></svg>
                    </div>
                    
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.04] bg-black/50">
                      {entry.product?.image ? <SafeImage src={entry.product.image} alt={entry.product?.name || ""} fill className="object-cover" sizes="48px" /> : <span className="flex h-full items-center justify-center text-[0.5rem] text-white/20">{t("img", "IMG")}</span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.85rem] font-medium text-white truncate">{entry.product?.name || "Unknown"}</p>
                      <p className="text-[0.65rem] text-gold mt-0.5">{entry.product?.price}</p>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => handleRemove(entry.productId)} 
                      disabled={saving}
                      aria-label={`Remove ${entry.product?.name}`}
                      className="text-[0.6rem] text-white/50 hover:text-burgundy hover:bg-burgundy/10 font-medium uppercase px-3 py-2 rounded-md transition-all duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="py-12 border border-dashed border-white/[0.1] rounded-xl flex flex-col items-center justify-center bg-surface/30">
              <span className="text-2xl mb-2 opacity-20">⊞</span>
              <p className="text-sm text-white/40">{t("no_products_selected", "No products selected.")}</p>
              <p className="text-[0.6rem] text-white/30 mt-1">{t("no_products_selected_desc", "Search and add products to feature them on the landing page.")}</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
function CollectionsEditor({ configId, data, allCollections, onChange, localSelectedCollectionIds, setLocalSelectedCollectionIds, initialSelectedCollectionIds, markUnsaved, searchQuery, setSearchQuery, searchResults, setSearchResults, showAdd, setShowAdd }: {
  configId: string;
  data: Record<string, unknown>;
  allCollections: CollectionEntry[];
  onChange: (d: Record<string, unknown>) => void;
  localSelectedCollectionIds: string[];
  setLocalSelectedCollectionIds: React.Dispatch<React.SetStateAction<string[]>>;
  initialSelectedCollectionIds: string[];
  markUnsaved: () => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchResults: Array<{ id: string; name: string; slug: string; image: string }>;
  setSearchResults: React.Dispatch<React.SetStateAction<Array<{ id: string; name: string; slug: string; image: string }>>>;
  showAdd: boolean;
  setShowAdd: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { t } = useTranslation("admin");
  const [saving, setSaving] = useState(false);

  const isDirty = JSON.stringify(localSelectedCollectionIds) !== JSON.stringify(initialSelectedCollectionIds);
  const isMaxReached = localSelectedCollectionIds.length >= 4;

  const selectedCollections = localSelectedCollectionIds
    .map((id) => allCollections.find((c) => c.id === id))
    .filter(Boolean) as CollectionEntry[];

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/admin/collections/picker?q=${encodeURIComponent(query)}`);
      if (res.ok) { const d = await res.json(); setSearchResults(d.collections || []); }
    } catch { /* ignore */ }
  }, [setSearchQuery, setSearchResults]);

  const handleAdd = useCallback((collection: { id: string; name: string; slug: string; image: string }) => {
    if (localSelectedCollectionIds.length >= 4) {
      toast.info(t("landing.max_collections", "Maximum 4 collections allowed."));
      return;
    }
    if (localSelectedCollectionIds.includes(collection.id)) {
      toast.info(t("landing.collection_already_selected", "Collection already selected."));
      return;
    }
    setLocalSelectedCollectionIds((prev) => [...prev, collection.id]);
    markUnsaved();
  }, [localSelectedCollectionIds, setLocalSelectedCollectionIds, markUnsaved, t]);

  const handleRemove = useCallback((collectionId: string) => {
    setLocalSelectedCollectionIds((prev) => prev.filter((id) => id !== collectionId));
    markUnsaved();
  }, [setLocalSelectedCollectionIds, markUnsaved]);

  const handleDragEnd = useCallback((newIds: string[]) => {
    setLocalSelectedCollectionIds(newIds);
    markUnsaved();
  }, [setLocalSelectedCollectionIds, markUnsaved]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const headerData = { ...data, selectedCollectionIds: localSelectedCollectionIds.filter(Boolean).join(",") };
      const res = await fetch("/api/admin/landing/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configId, sectionType: "collections", data: headerData })
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || t("landing_failed_save", "Failed to save"));
      toast.success(t("landing.collections_saved", "Collections updated successfully."));
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("landing_error_saving", "Error saving"));
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setLocalSelectedCollectionIds([...initialSelectedCollectionIds]);
    toast.info(t("landing.changes_discarded", "Changes discarded."));
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("landing_section_header", "Section Header")} icon="⊞">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_shop_by_collection", "Shop by Collection")} />
          <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_the_collections", "THE COLLECTIONS")} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_view_all", "VIEW ALL")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>
      <SectionCard title={t("collections", "Collections")} icon="⊞">
        <div className="mb-5 flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/90">{t("selected_collections_count", "Selected Collections")} <span className="ms-2 rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] font-medium tracking-wider text-gold">{localSelectedCollectionIds.length} / 4 {t("selected", "Selected")}</span></p>
            {isMaxReached && <p className="text-[0.6rem] text-burgundy mt-1">{t("max_4_collections", "Maximum 4 collections.")}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDirty && (
              <button type="button" onClick={handleDiscard} disabled={saving} className="btn-secondary h-10 px-4 text-[0.6rem] disabled:opacity-50">
                {t("discard_changes", "Discard Changes")}
              </button>
            )}
            <button type="button" onClick={handleSave} disabled={!isDirty || saving} className="btn-primary flex h-10 items-center gap-2 px-4 text-[0.6rem] disabled:opacity-50">
              {saving ? t("landing_saving", "Saving...") : t("save_collections", "Save Collections")}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <button type="button" onClick={() => setShowAdd(!showAdd)} disabled={saving} className="btn-secondary h-10 w-full px-5 text-[0.65rem] disabled:opacity-50 sm:w-auto">
            {showAdd ? t("close_search", "Close Search") : t("search_add_collections", "Search & Add Collections")}
          </button>
        </div>

        {showAdd && (
          <div className="mb-6 border-y border-white/[0.06] py-4">
            <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder={t("landing_search_collections", "Search collections by name or slug...")} className="input-premium w-full mb-3 bg-surface" />
            {searchResults.length > 0 && (
              <div className="max-h-64 space-y-2 overflow-y-auto pe-2">
                {searchResults.map((c) => {
                  const isSelected = localSelectedCollectionIds.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-black/25 p-2.5 transition-colors hover:border-white/[0.1] sm:gap-4">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/5">
                        {c.image ? <SafeImage src={c.image} alt={c.name} fill className="object-cover" sizes="40px" /> : <span className="text-[0.5rem] text-white/30">{t("img", "IMG")}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{c.name}</p>
                        <p className="text-[0.6rem] text-white/40 mt-0.5">/{c.slug}</p>
                      </div>
                      <button type="button" onClick={() => handleAdd(c)} disabled={isSelected || (isMaxReached && !isSelected) || saving} className={`inline-flex h-9 min-w-[72px] items-center justify-center rounded px-3 text-center text-[0.6rem] font-medium uppercase transition-all duration-200 ${isSelected ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"}`}>
                        {isSelected ? "✔ Selected" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[0.55rem] text-white/30 uppercase tracking-[0.1em] mb-2 px-1">{t("selected_order_drag", "Selected Order (Drag to reorder)")}</p>
          {selectedCollections.length > 0 ? (
            <Reorder.Group axis="y" values={localSelectedCollectionIds} onReorder={handleDragEnd} className="space-y-2">
              {localSelectedCollectionIds.map((id) => {
                const col = allCollections.find((c) => c.id === id);
                if (!col) return null;
                return (
                  <Reorder.Item key={id} value={id} className="cursor-grab active:cursor-grabbing">
                    <div className={`flex min-h-[72px] items-center gap-3 rounded-lg border ${saving ? 'opacity-50' : ''} border-white/[0.08] bg-black/20 p-3 transition-colors hover:border-gold/30 sm:gap-4`}>
                      <div className="text-white/20 hover:text-white/40 cursor-grab px-1">
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><path d="M4 4C4 5.10457 3.10457 6 2 6C0.89543 6 0 5.10457 0 4C0 2.89543 0.89543 2 2 2C3.10457 2 4 2.89543 4 4ZM4 10C4 11.1046 3.10457 12 2 12C0.89543 12 0 11.1046 0 10C0 8.89543 0.89543 8 2 8C3.10457 8 4 8.89543 4 10ZM4 16C4 17.1046 3.10457 18 2 18C0.89543 18 0 17.1046 0 16C0 14.8954 0.89543 14 2 14C3.10457 14 4 14.8954 4 16ZM12 4C12 5.10457 11.1046 6 10 6C8.89543 6 8 5.10457 8 4C8 2.89543 8.89543 2 10 2C11.1046 2 12 2.89543 12 4ZM12 10C12 11.1046 11.1046 12 10 12C8.89543 12 8 11.1046 8 10C8 8.89543 8.89543 8 10 8C11.1046 8 12 8.89543 12 10ZM12 16C12 17.1046 11.1046 18 10 18C8.89543 18 8 17.1046 8 16C8 14.8954 8.89543 14 10 14C11.1046 14 12 14.8954 12 16Z"/></svg>
                      </div>
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.04] bg-black/50">
                        {col.image ? <SafeImage src={col.image} alt={col.name} fill className="object-cover" sizes="48px" /> : <span className="flex h-full items-center justify-center text-[0.5rem] text-white/20">{t("img", "IMG")}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.85rem] font-medium text-white truncate">{col.name}</p>
                        <p className="text-[0.65rem] text-white/40 mt-0.5">/{col.slug}</p>
                      </div>
                      <button type="button" onClick={() => handleRemove(id)} disabled={saving} aria-label={`Remove ${col.name}`} className="text-[0.6rem] text-white/50 hover:text-burgundy hover:bg-burgundy/10 font-medium uppercase px-3 py-2 rounded-md transition-all duration-200">
                        Remove
                      </button>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          ) : (
            <div className="py-12 border border-dashed border-white/[0.1] rounded-xl flex flex-col items-center justify-center bg-surface/30">
              <span className="text-2xl mb-2 opacity-20">⊞</span>
              <p className="text-sm text-white/40">{t("no_collections_selected", "No collections selected.")}</p>
              <p className="text-[0.6rem] text-white/30 mt-1">{t("no_collections_selected_desc", "Search and add collections to feature them on the landing page.")}</p>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function TestimonialsEditor({ data, onChange, onManage }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onManage?: () => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("landing_section_header", "Section Header")} icon="♢">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_testimonials", "Testimonials")} />
          <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_what_they_say", "WHAT THEY SAY")} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_view_all_reviews", "View all reviews")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/reviews" />
        </div>
      </SectionCard>
      {onManage && (
        <SectionCard title={t("manage_testimonials", "Manage Testimonials")} icon="♢">
          <p className="text-[0.65rem] text-white/45 mb-3">{t("testimonials_desc", "Create, edit, delete, and reorder testimonials shown on the homepage.")}</p>
          <button type="button" onClick={onManage} className="btn-primary text-[0.6rem]">{t("manage_testimonials", "Manage Testimonials")}</button>
        </SectionCard>
      )}
    </div>
  );
}

function MoroccanMomentEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("content", "Content")} icon="◎">
        <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_pour_serve_savor", "Pour. Serve. Savor.")} />
        <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_monadaty_moment", "THE MONADATY MOMENT")} />
        <Input label={t("description", "Description")} name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={3} placeholder={t("ph_good_moments", "MONADATY is designed for the good moments...")} />
        <ImageField label={t("image_label", "Image")} value={(data.media as string) || ""} onChange={(v) => onChange({ media: v })} folder="monadaty/moment" />
        <Input label={t("quote_optional", "Quote (optional)")} name="quote" value={(data.quote as string) || ""} onChange={(v) => onChange({ quote: v })} placeholder={t("ph_quote_moment", "A quote about the moment...")} rows={2} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_explore_drinks", "EXPLORE DRINKS")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>
    </div>
  );
}

function NewsletterEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("content", "Content")} icon="✉">
        <Input label={t("title", "Title")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_stay_close", "Stay Close.")} />
        <Input label={t("subtitle", "Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_inner_circle", "THE INNER CIRCLE")} />
        <Input label={t("description", "Description")} name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={2} placeholder={t("ph_monadaty_circle", "Join the MONADATY circle...")} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("input_placeholder", "Input Placeholder")} name="placeholder" value={(data.placeholder as string) || ""} onChange={(v) => onChange({ placeholder: v })} placeholder={t("ph_your_email", "Your email")} />
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_join", "Join")} />
        </div>
      </SectionCard>
    </div>
  );
}

function FinalCtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title={t("visibility", "Visibility")} icon="👁">
        <Toggle label={t("landing_show_on_homepage", "Show on homepage")} checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title={t("content", "Content")} icon="▶">
        <Input label={t("eyebrow_subtitle", "Eyebrow / Subtitle")} name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder={t("ph_begin_pour", "BEGIN THE POUR")} />
        <Input label={t("headline", "Headline")} name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_next_favorite", "YOUR NEXT FAVORITE TASTE IS WAITING.")} />
        <Input label={t("description", "Description")} name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={2} placeholder={t("ph_discover_collection", "Discover the MONADATY collection...")} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label={t("button_text", "Button Text")} name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder={t("ph_shop_now", "SHOP NOW")} />
          <Input label={t("button_link", "Button Link")} name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
        <Input label={t("background_style_optional", "Background Style (optional)")} name="background" value={(data.background as string) || ""} onChange={(v) => onChange({ background: v })} placeholder={t("leave_empty_burgundy", "Leave empty for default burgundy")} />
      </SectionCard>
    </div>
  );
}

function SeoEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  const { t } = useTranslation("admin");
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <SectionCard title={t("search_engine", "Search Engine")} icon="🔍">
        <Input label={t("page_title", "Page Title")} name="title" value={data.title || ""} onChange={(v) => onChange({ title: v })} placeholder={t("ph_seo_title_default", "MONADATY — Premium Moroccan Beverages")} maxLength={70} />
        <p className="text-[0.55rem] text-white/25 mt-1">{(data.title || "").length}/70 {t("characters", "characters")}</p>
        <Input label={t("meta_description", "Meta Description")} name="metaDescription" value={data.metaDescription || ""} onChange={(v) => onChange({ metaDescription: v })} rows={2} placeholder={t("ph_seo_desc_default", "Premium Moroccan beverages, crafted with intention...")} maxLength={160} />
        <p className="text-[0.55rem] text-white/25">{(data.metaDescription || "").length}/160 {t("characters", "characters")}</p>
      </SectionCard>
      <SectionCard title={t("open_graph", "Open Graph (Facebook, LinkedIn)")} icon="📱">
        <Input label={t("og_title", "OG Title")} name="ogTitle" value={data.ogTitle || ""} onChange={(v) => onChange({ ogTitle: v })} placeholder={t("ph_seo_title_default", "MONADATY — Premium Moroccan Beverages")} />
        <Input label={t("og_description", "OG Description")} name="ogDescription" value={data.ogDescription || ""} onChange={(v) => onChange({ ogDescription: v })} rows={2} placeholder={t("ph_seo_discover", "Discover MONADATY...")} />
        <ImageField label={t("og_image", "OG Image")} value={data.ogImage || ""} onChange={(v) => onChange({ ogImage: v })} folder="monadaty/seo" />
      </SectionCard>
      <SectionCard title={t("canonical", "Canonical")} icon="🔗">
        <Input label={t("canonical_url", "Canonical URL")} name="canonicalUrl" value={data.canonicalUrl || ""} onChange={(v) => onChange({ canonicalUrl: v })} placeholder="https://monadaty.com/" />
      </SectionCard>
    </div>
  );
}
