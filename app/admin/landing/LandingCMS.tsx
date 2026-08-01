"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Reorder } from "framer-motion";
import type { LandingPageData } from "@/lib/landing-cms";
import type { StoredTestimonial } from "@/types";
import { SafeImage } from "@/components/SafeImage";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import {
  HeroPreview,
  FeaturedPreview,
  CollectionsPreview,
  BrandStoryPreview,
  SocialProofPreview,
  MoroccanMomentPreview,
  NewsletterPreview,
  FinalCtaPreview,
} from "@/components/LandingPreview";

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
  testimonials: StoredTestimonial[];
  featuredEntries: FeaturedEntry[];
  allCollections: CollectionEntry[];
  versions: VersionInfo[];
};

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  featured: "Featured Products",
  collections: "Collections",
  about: "Brand Story",
  testimonials: "Testimonials",
  moroccan_moment: "Moroccan Moment",
  newsletter: "Newsletter",
  final_cta: "Final CTA",
  seo: "SEO",
};

const SECTION_ICONS: Record<string, string> = {
  hero: "◇", featured: "□", collections: "⊞", about: "△",
  testimonials: "♢", moroccan_moment: "◎", newsletter: "✉", final_cta: "▶", seo: "⚙",
};

const BREAKPOINT_LABELS: Record<string, string> = {
  desktop: "1920px", laptop: "1440px", tablet: "768px", mobile: "375px",
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
        <textarea id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} maxLength={maxLength} placeholder={placeholder} className="input-premium w-full resize-y min-h-[72px]" />
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
      <SingleImageUploader label="" value={value} onChange={onChange} folder={folder || "monadaty/landing"} />
    </div>
  );
}

function SectionCard({ title, icon, children, badge }: {
  title: string; icon?: string; children: React.ReactNode; badge?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-surface/50 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span className="text-sm text-gold/70">{icon}</span>}
          <h3 className="text-sm font-medium text-white">{title}</h3>
        </div>
        {badge}
      </div>
      {children}
    </div>
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

export function LandingCMS({ configId, landingData, testimonials, featuredEntries, allCollections, versions }: Props) {
  const [draft, setDraft] = useState<DraftData>(() => initDraft(landingData));
  const [order, setOrder] = useState<string[]>(() => [...landingData.sectionOrder]);
  const [activeSection, setActiveSection] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [status, setStatus] = useState(landingData.status);
  const [publishedAt, setPublishedAt] = useState(landingData.publishedAt);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [breakpoint, setBreakpoint] = useState<"desktop" | "laptop" | "tablet" | "mobile">("desktop");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSavedRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

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
        await apiPut("/api/admin/landing/sections", { configId, sectionType, data: { ...data, configId: undefined, id: undefined } });
      }
      await apiPut("/api/admin/landing/order", { configId, order });
      if (draft.seo) await apiPut("/api/admin/landing/seo", { configId, ...draft.seo });
      setStatus("draft");
      setUnsaved(false);
      showToast("Draft saved", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
    }
    setSaving(false);
  }, [configId, draft, order, showToast]);

  const handlePublish = useCallback(async () => {
    if (!confirm("Publish landing page? This updates the public homepage immediately.")) return;
    setPublishing(true);
    try {
      await handleSave();
      await apiPost("/api/admin/landing/publish", { configId });
      setStatus("published");
      setPublishedAt(new Date().toISOString());
      showToast("Published!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to publish", "error");
    }
    setPublishing(false);
  }, [configId, handleSave, showToast]);

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

  // Auto-save every 30s if unsaved
  useEffect(() => {
    if (!unsaved) return;
    lastSavedRef.current = setTimeout(() => {
      handleSave();
    }, 30000);
    return () => { if (lastSavedRef.current) clearTimeout(lastSavedRef.current); };
  }, [unsaved, handleSave]);

  const handleReorderSections = useCallback((newOrder: string[]) => {
    setOrder(newOrder);
    markUnsaved();
  }, [markUnsaved]);

  const visibleTestimonials = testimonials.filter((t) => t.visible);
  const visibleTestimonialsSimple = visibleTestimonials.map((t) => ({ id: t.id, name: t.name, role: t.role, content: t.content }));

  const BREAKPOINT_SIZES: Record<string, { width: string; height: string }> = {
    desktop: { width: "100%", height: "100%" },
    laptop: { width: "1024px", height: "700px" },
    tablet: { width: "768px", height: "500px" },
    mobile: { width: "375px", height: "600px" },
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#171717]">
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-4 py-3 text-sm shadow-lg transition-all duration-300 ${toast.type === "success" ? "bg-emerald-600 text-white" : toast.type === "error" ? "bg-burgundy text-white" : "bg-surface text-white"}`}>
          {toast.message}
          {unsaved && <span className="ml-2 text-[0.6rem] opacity-70">(unsaved)</span>}
        </div>
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-60 shrink-0 border-r border-white/[0.06] flex flex-col bg-[#171717]">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.55rem] font-medium uppercase tracking-[0.15em] text-white/30">Landing Page</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${status === "published" ? "bg-emerald-400" : "bg-gold animate-pulse"}`} />
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-white/50">{status}</span>
              </div>
            </div>
            {publishedAt && <span className="text-[0.5rem] text-white/25">{(new Date(publishedAt)).toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <p className="text-[0.5rem] font-medium uppercase tracking-[0.15em] text-white/20 px-2 mb-2">Sections</p>
          <Reorder.Group axis="y" values={order} onReorder={handleReorderSections} className="space-y-0.5">
            {order.map((key) => {
              const sectionKey = key;
              const displayLabel = SECTION_LABELS[sectionKey] || sectionKey;
              const icon = SECTION_ICONS[sectionKey] || "•";
              return (
                <Reorder.Item key={sectionKey} value={sectionKey} className="cursor-grab active:cursor-grabbing">
                  <button
                    onClick={() => setActiveSection(sectionKey)}
                    className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-all duration-150 ${
                      activeSection === sectionKey
                        ? "bg-burgundy/15 text-white border-l-[3px] border-burgundy"
                        : "text-white/40 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent"
                    }`}
                  >
                    <span className="text-[0.65rem]">{icon}</span>
                    <span className="flex-1 truncate text-[0.7rem]">{displayLabel}</span>
                    <span className="text-[0.5rem] text-white/20">⋮⋮</span>
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        <div className="border-t border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.5rem] font-medium uppercase tracking-[0.1em] text-white/25">{versions.length} versions</span>
            <button onClick={() => setShowVersions(true)} className="text-[0.6rem] text-gold hover:text-gold-light transition-colors">History</button>
          </div>
          <div className="text-[0.5rem] text-white/20">Ctrl+S to save</div>
        </div>
      </aside>

      {/* ── CENTER PANEL ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#171717]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-white">{SECTION_LABELS[activeSection] || activeSection}</h2>
            {unsaved && <span className="text-[0.55rem] text-gold bg-gold/10 px-2 py-0.5 rounded-full animate-pulse">Unsaved</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[0.6rem] font-medium uppercase tracking-[0.1em] ${status === "published" ? "text-emerald-400" : "text-gold"}`}>
              {status === "published" ? "● Published" : "○ Draft"}
            </span>
            <button onClick={handleSave} disabled={saving} className="btn-primary-sm h-8 px-4 text-[0.55rem]">{saving ? "Saving..." : "Save Draft"}</button>
            <button onClick={handlePublish} disabled={publishing || saving} className="btn-gold h-8 px-4 text-[0.55rem]">{publishing ? "Publishing..." : "Publish"}</button>
            <a href="/" target="_blank" rel="noreferrer" className="btn-secondary h-8 px-4 text-[0.55rem]">View Site</a>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "hero" && draft.hero && <HeroEditor data={draft.hero} onChange={(d) => patchDraft("hero", d)} />}
          {activeSection === "about" && draft.brandStory && <BrandStoryEditor data={draft.brandStory} onChange={(d) => patchDraft("brandStory", d)} />}
          {activeSection === "featured" && draft.featured && <FeaturedEditor data={draft.featured} onChange={(d) => patchDraft("featured", d)} featuredEntries={featuredEntries} />}
          {activeSection === "collections" && draft.collectionHeader && <CollectionsEditor data={draft.collectionHeader} onChange={(d) => patchDraft("collectionHeader", d)} allCollections={allCollections} />}
          {activeSection === "testimonials" && draft.testimonialHeader && <TestimonialsEditor data={draft.testimonialHeader} onChange={(d) => patchDraft("testimonialHeader", d)} />}
          {activeSection === "moroccan_moment" && draft.moroccanMoment && <MoroccanMomentEditor data={draft.moroccanMoment} onChange={(d) => patchDraft("moroccanMoment", d)} />}
          {activeSection === "newsletter" && draft.newsletter && <NewsletterEditor data={draft.newsletter} onChange={(d) => patchDraft("newsletter", d)} />}
          {activeSection === "final_cta" && draft.finalCta && <FinalCtaEditor data={draft.finalCta} onChange={(d) => patchDraft("finalCta", d)} />}
          {activeSection === "seo" && draft.seo && <SeoEditor data={draft.seo as Record<string, string>} onChange={(d) => patchDraft("seo", d)} />}
        </div>
      </div>

      {/* ── RIGHT PANEL (Live Preview) ── */}
      <aside className="w-[380px] shrink-0 border-l border-white/[0.06] bg-[#0a0a0a] flex flex-col">
        {/* Device selector */}
        <div className="border-b border-white/[0.06] px-4 py-2 flex items-center justify-between bg-[#171717]">
          <span className="text-[0.55rem] font-medium uppercase tracking-[0.15em] text-white/30">Preview</span>
          <div className="flex items-center gap-1">
            {(Object.keys(BREAKPOINT_LABELS) as Array<keyof typeof BREAKPOINT_LABELS>).map((bp) => (
              <button key={bp} onClick={() => setBreakpoint(bp as "desktop" | "laptop" | "tablet" | "mobile")} className={`px-2 py-1 rounded text-[0.5rem] font-medium transition-colors ${breakpoint === bp ? "bg-gold/20 text-gold" : "text-white/30 hover:text-white/60"}`}>
                {BREAKPOINT_LABELS[bp]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0a0a0a] p-4 flex justify-center">
          <div
            className="bg-white transition-all duration-300 overflow-hidden shadow-2xl"
            style={{
              width: BREAKPOINT_SIZES[breakpoint].width,
              height: BREAKPOINT_SIZES[breakpoint].height,
              maxHeight: "calc(100vh - 10rem)",
            }}
          >
            <PreviewContent
              draft={draft}
              order={order}
              testimonials={visibleTestimonialsSimple}
              collections={allCollections.filter((c) => c.landingEnabled)}
              allProducts={featuredEntries.map((e) => e.product).filter(Boolean) as { id: string; name: string; slug: string; price: string; image: string }[]}
            />
          </div>
        </div>
      </aside>

      {/* ── VERSION HISTORY MODAL ── */}
      {showVersions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVersions(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/[0.06] bg-[#171717] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h3 className="text-sm font-medium text-white">Version History</h3>
              <button onClick={() => setShowVersions(false)} className="text-white/40 hover:text-white text-lg">&times;</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
              {versions.length === 0 && <p className="text-sm text-white/40 text-center py-8">No versions saved yet</p>}
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
                        showToast(`Restored v${v.version}`, "success");
                        setTimeout(() => window.location.reload(), 1000);
                      } catch { showToast("Failed to restore", "error"); }
                    }}
                    className="btn-primary-sm h-7 px-3 text-[0.5rem]"
                  >Restore</button>
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
  const layout = (data.layout || {}) as Record<string, unknown>;
  const patch = (patch: Record<string, unknown>) => onChange(patchLayout(data, patch));
  return (
    <SectionCard title="Section Settings" icon="⚙">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Background</label>
          <select value={(layout.bgVariant as string) || "default"} onChange={(e) => patch({ bgVariant: e.target.value })} className="input-premium w-full">
            <option value="default">Default</option>
            <option value="surface">Surface</option>
            <option value="burgundy">Burgundy</option>
            <option value="burgundy-dark">Dark Burgundy</option>
            <option value="custom">Custom</option>
          </select>
          {(layout.bgVariant as string) === "custom" && (
            <div className="mt-2">
              <Input label="" name="customBg" value={(layout.customBg as string) || ""} onChange={(v) => patch({ customBg: v })} placeholder="#171717" />
            </div>
          )}
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Max Width</label>
          <select value={(layout.maxWidth as string) || "1400"} onChange={(e) => patch({ maxWidth: e.target.value })} className="input-premium w-full">
            <option value="1400">Standard (1400px)</option>
            <option value="1600">Wide (1600px)</option>
            <option value="full">Full Width</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Padding Top</label>
          <select value={(layout.pt as string) || "16"} onChange={(e) => patch({ pt: e.target.value })} className="input-premium w-full">
            <option value="12">Small (py-12)</option>
            <option value="16">Medium (py-16)</option>
            <option value="20">Large (py-20)</option>
            <option value="24">XL (py-24)</option>
            <option value="0">None</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Padding Bottom</label>
          <select value={(layout.pb as string) || "16"} onChange={(e) => patch({ pb: e.target.value })} className="input-premium w-full">
            <option value="12">Small (py-12)</option>
            <option value="16">Medium (py-16)</option>
            <option value="20">Large (py-20)</option>
            <option value="24">XL (py-24)</option>
            <option value="0">None</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Border Radius</label>
          <select value={(layout.radius as string) || "none"} onChange={(e) => patch({ radius: e.target.value })} className="input-premium w-full">
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">XL</option>
            <option value="2xl">2XL</option>
          </select>
        </div>
        <div>
          <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Animation</label>
          <select value={(layout.animation as string) || "fade-up"} onChange={(e) => patch({ animation: e.target.value })} className="input-premium w-full">
            <option value="none">None</option>
            <option value="fade-up">Fade Up</option>
            <option value="fade-in">Fade In</option>
            <option value="scale-in">Scale In</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );
}

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Content" icon="◇">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Headline" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="TASTE\nREDEFINED." />
          <Input label="Subheadline" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="Premium Soda — Moroccan Craft" />
        </div>
        <Input label="Description" name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={3} placeholder="A refined soda experience..." />
        <ImageField label="Background Image" value={(data.media as string[])?.[0] || ""} onChange={(url) => onChange({ media: url ? [url] : [] })} folder="monadaty/hero" />
      </SectionCard>
      <SectionCard title="Primary CTA" icon="▶">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Button Text" name="ctaText" value={(data.ctaText as string) || ""} onChange={(v) => onChange({ ctaText: v })} placeholder="Shop MONADATY" />
          <Input label="Button Link" name="ctaLink" value={(data.ctaLink as string) || ""} onChange={(v) => onChange({ ctaLink: v })} placeholder="/shop" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Target</label>
            <select value={(data.ctaTarget as string) || "_self"} onChange={(e) => onChange({ ctaTarget: e.target.value })} className="input-premium w-full">
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Variant</label>
            <select value={(data.ctaVariant as string) || "primary"} onChange={(e) => onChange({ ctaVariant: e.target.value })} className="input-premium w-full">
              <option value="primary">Primary (Gold)</option>
              <option value="secondary">Outline</option>
              <option value="burgundy">Burgundy</option>
            </select>
          </div>
          <div>
            <label className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white/50 block mb-1.5">Alignment</label>
            <select value={(data.alignment as string) || "left"} onChange={(e) => onChange({ alignment: e.target.value })} className="input-premium w-full">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Secondary CTA" icon="◇">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Button Text" name="secondaryCtaText" value={(data.secondaryCtaText as string) || ""} onChange={(v) => onChange({ secondaryCtaText: v })} placeholder="EXPLORE COLLECTIONS" />
          <Input label="Button Link" name="secondaryCtaLink" value={(data.secondaryCtaLink as string) || ""} onChange={(v) => onChange({ secondaryCtaLink: v })} placeholder="/collections" />
        </div>
      </SectionCard>
      <SectionCard title="Design" icon="⚙">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Background Style" name="background" value={(data.background as string) || ""} onChange={(v) => onChange({ background: v })} placeholder="#171717 or gradient..." />
          <Input label="Overlay Opacity (0–1)" name="overlayOpacity" value={String(data.overlayOpacity ?? 0)} onChange={(v) => onChange({ overlayOpacity: parseFloat(v) || 0 })} placeholder="0.0" />
        </div>
      </SectionCard>
    </div>
  );
}

function BrandStoryEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Content" icon="△">
        <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Our Story" />
        <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="BORN IN MOROCCO" />
        <Input label="Description" name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={5} placeholder="MONADATY was born in Casablanca..." />
        <ImageField label="Image" value={(data.image as string) || ""} onChange={(v) => onChange({ image: v })} folder="monadaty/about" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="DISCOVER OUR STORY" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/about" />
        </div>
      </SectionCard>
    </div>
  );
}
function FeaturedEditor({ data, featuredEntries, onChange }: {
  data: Record<string, unknown>;
  featuredEntries: FeaturedEntry[];
  onChange: (d: Record<string, unknown>) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; price: string; image: string }>>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [reorderPending, setReorderPending] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/admin/products/picker?q=${encodeURIComponent(query)}`);
      if (res.ok) { const d = await res.json(); setSearchResults(d.products || []); }
    } catch { /* ignore */ }
  }, []);

  const handleAdd = useCallback(async (productId: string) => {
    try {
      const currentIds = featuredEntries.map((e) => e.productId).filter(Boolean);
      if (!currentIds.includes(productId)) {
        currentIds.push(productId);
      }
      await apiPut("/api/admin/landing/sections", { configId: "featured", sectionType: "featured", data: { productIds: currentIds.join(",") } });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }, [featuredEntries]);

  const handleDragEnd = useCallback(async (newEntries: FeaturedEntry[]) => {
    setReorderPending(true);
    try {
      const productIds = newEntries.map((e) => e.productId).filter(Boolean).join(",");
      await apiPut("/api/admin/landing/sections", { configId: "featured", sectionType: "featured", data: { productIds } });
      window.location.reload();
    } catch {
      window.location.reload();
    }
    setReorderPending(false);
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Section Header" icon="□">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Featured" />
          <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="SELECTED FLAVORS" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="VIEW ALL" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>
      <SectionCard title={`Products (${featuredEntries.length} selected)`} icon="⊞">
        <p className="text-[0.55rem] text-white/30 mb-3">Drag to reorder products on the homepage.</p>
        <div className="mb-3">
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary-sm text-[0.55rem]">{showAdd ? "Hide Search" : "+ Add Products"}</button>
        </div>
        {showAdd && (
          <div className="mb-4">
            <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search products by name, SKU, or category..." className="input-premium w-full mb-2" />
            {searchResults.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-surface max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => handleAdd(p.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                      {p.image ? <SafeImage src={p.image} alt={p.name} fill className="object-cover" sizes="32px" /> : <span className="text-[0.5rem] text-white/30">IMG</span>}
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{p.name}</p><p className="text-[0.6rem] text-gold">{p.price}</p></div>
                    <span className="text-[0.55rem] text-emerald-400">+ Add</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {featuredEntries.length > 0 ? (
          <Reorder.Group axis="y" values={featuredEntries} onReorder={handleDragEnd} className="space-y-2">
            {featuredEntries.map((entry) => (
              <Reorder.Item key={entry.id} value={entry} className="cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface/50 p-3">
                  <span className="text-white/20 me-1">⋮⋮</span>
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 overflow-hidden">
                    {entry.product?.image ? <SafeImage src={entry.product.image} alt={entry.product?.name || ""} fill className="object-cover" sizes="40px" /> : <span className="flex h-full items-center justify-center text-[0.5rem] text-white/20">IMG</span>}
                  </div>
                  <span className="flex-1 text-sm text-white truncate">{entry.product?.name || "Unknown"}</span>
                  <span className="text-[0.65rem] text-gold">{entry.product?.price}</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <p className="text-sm text-white/30 text-center py-4">No products selected. Click &ldquo;+ Add Products&rdquo; above.</p>
        )}
        {reorderPending && <p className="text-[0.55rem] text-gold mt-2">Saving order...</p>}
      </SectionCard>
    </div>
  );
}
function CollectionsEditor({ data, allCollections, onChange }: {
  data: Record<string, unknown>; allCollections: CollectionEntry[]; onChange: (d: Record<string, unknown>) => void;
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Section Header" icon="⊞">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Shop by Collection" />
          <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="THE COLLECTIONS" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="VIEW ALL" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>
      <SectionCard title="Collections on Homepage" icon="⊟">
        <div className="space-y-2">
          {allCollections.filter((c) => c.landingEnabled).map((col) => (
            <div key={col.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-surface/50 p-3">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                {col.image ? <SafeImage src={col.image} alt={col.name} fill className="object-cover" sizes="40px" /> : <span className="text-sm text-white/30">{col.name.charAt(0)}</span>}
              </div>
              <span className="flex-1 text-sm text-white">{col.name}</span>
              <span className="text-[0.5rem] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Visible</span>
            </div>
          ))}
          {allCollections.filter((c) => !c.landingEnabled).map((col) => (
            <div key={col.id} className="flex items-center gap-3 rounded-xl border border-dashed border-white/[0.06] bg-surface/30 p-3 opacity-50">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
                <span className="text-sm text-white/30">{col.name.charAt(0)}</span>
              </div>
              <span className="flex-1 text-sm text-white/60">{col.name}</span>
              <span className="text-[0.5rem] text-white/20">(hidden)</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TestimonialsEditor({ data, onChange, onManage }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void; onManage?: () => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Section Header" icon="♢">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Testimonials" />
          <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="WHAT THEY SAY" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="View all reviews" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/reviews" />
        </div>
      </SectionCard>
      {onManage && (
        <SectionCard title="Manage Testimonials" icon="♢">
          <p className="text-[0.65rem] text-white/45 mb-3">Create, edit, delete, and reorder testimonials shown on the homepage.</p>
          <button type="button" onClick={onManage} className="btn-primary text-[0.6rem]">Manage Testimonials</button>
        </SectionCard>
      )}
    </div>
  );
}

function MoroccanMomentEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Content" icon="◎">
        <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Pour. Serve. Savor." />
        <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="THE MONADATY MOMENT" />
        <Input label="Description" name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={3} placeholder="MONADATY is designed for the good moments..." />
        <ImageField label="Image" value={(data.media as string) || ""} onChange={(v) => onChange({ media: v })} folder="monadaty/moment" />
        <Input label="Quote (optional)" name="quote" value={(data.quote as string) || ""} onChange={(v) => onChange({ quote: v })} placeholder="A quote about the moment..." rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="EXPLORE DRINKS" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
      </SectionCard>
    </div>
  );
}

function NewsletterEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Content" icon="✉">
        <Input label="Title" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="Stay Close." />
        <Input label="Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="THE INNER CIRCLE" />
        <Input label="Description" name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={2} placeholder="Join the MONADATY circle..." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Input Placeholder" name="placeholder" value={(data.placeholder as string) || ""} onChange={(v) => onChange({ placeholder: v })} placeholder="Your email" />
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="Join" />
        </div>
      </SectionCard>
    </div>
  );
}

function FinalCtaEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionSettings data={data} onChange={onChange} />
      <SectionCard title="Visibility" icon="👁">
        <Toggle label="Show on homepage" checked={data.enabled as boolean} onChange={(v) => onChange({ enabled: v })} />
      </SectionCard>
      <SectionCard title="Content" icon="▶">
        <Input label="Eyebrow / Subtitle" name="subtitle" value={(data.subtitle as string) || ""} onChange={(v) => onChange({ subtitle: v })} placeholder="BEGIN THE POUR" />
        <Input label="Headline" name="title" value={(data.title as string) || ""} onChange={(v) => onChange({ title: v })} placeholder="YOUR NEXT FAVORITE TASTE IS WAITING." />
        <Input label="Description" name="description" value={(data.description as string) || ""} onChange={(v) => onChange({ description: v })} rows={2} placeholder="Discover the MONADATY collection..." />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Button Text" name="buttonText" value={(data.buttonText as string) || ""} onChange={(v) => onChange({ buttonText: v })} placeholder="SHOP NOW" />
          <Input label="Button Link" name="buttonLink" value={(data.buttonLink as string) || ""} onChange={(v) => onChange({ buttonLink: v })} placeholder="/shop" />
        </div>
        <Input label="Background Style (optional)" name="background" value={(data.background as string) || ""} onChange={(v) => onChange({ background: v })} placeholder="Leave empty for default burgundy" />
      </SectionCard>
    </div>
  );
}

function SeoEditor({ data, onChange }: { data: Record<string, string>; onChange: (d: Record<string, string>) => void }) {
  return (
    <div className="max-w-3xl space-y-6">
      <SectionCard title="Search Engine" icon="🔍">
        <Input label="Page Title" name="title" value={data.title || ""} onChange={(v) => onChange({ title: v })} placeholder="MONADATY — Premium Moroccan Beverages" maxLength={70} />
        <p className="text-[0.55rem] text-white/25 mt-1">{(data.title || "").length}/70 characters</p>
        <Input label="Meta Description" name="metaDescription" value={data.metaDescription || ""} onChange={(v) => onChange({ metaDescription: v })} rows={2} placeholder="Premium Moroccan beverages, crafted with intention..." maxLength={160} />
        <p className="text-[0.55rem] text-white/25">{(data.metaDescription || "").length}/160 characters</p>
      </SectionCard>
      <SectionCard title="Open Graph (Facebook, LinkedIn)" icon="📱">
        <Input label="OG Title" name="ogTitle" value={data.ogTitle || ""} onChange={(v) => onChange({ ogTitle: v })} placeholder="MONADATY — Premium Moroccan Beverages" />
        <Input label="OG Description" name="ogDescription" value={data.ogDescription || ""} onChange={(v) => onChange({ ogDescription: v })} rows={2} placeholder="Discover MONADATY..." />
        <ImageField label="OG Image" value={data.ogImage || ""} onChange={(v) => onChange({ ogImage: v })} folder="monadaty/seo" />
      </SectionCard>
      <SectionCard title="Canonical" icon="🔗">
        <Input label="Canonical URL" name="canonicalUrl" value={data.canonicalUrl || ""} onChange={(v) => onChange({ canonicalUrl: v })} placeholder="https://monadaty.com/" />
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LIVE PREVIEW
   ═══════════════════════════════════════════════ */
function PreviewContent({ draft, order, testimonials, collections, allProducts }: {
  draft: DraftData;
  order: string[];
  testimonials: { id: string; name: string; role: string; content: string }[];
  collections: CollectionEntry[];
  allProducts: { id: string; name: string; slug: string; price: string; image: string }[];
}) {
  const hero = draft.hero;
  const brandStory = draft.brandStory;
  const featured = draft.featured;
  const collectionHeader = draft.collectionHeader;
  const testimonialHeader = draft.testimonialHeader;
  const moroccanMoment = draft.moroccanMoment;
  const finalCta = draft.finalCta;
  const newsletter = draft.newsletter;

  const safeCollections = Array.isArray(collections) ? collections.filter(Boolean) : [];
  const safeProducts = Array.isArray(allProducts) ? allProducts.filter(Boolean) : [];
  const safeTestimonials = Array.isArray(testimonials) ? testimonials.filter(Boolean) : [];
  const safeOrder = Array.isArray(order) ? order : [];

  const sectionMap: Record<string, React.ReactNode> = {};

  if (hero?.enabled) {
    const media = Array.isArray(hero.media as string[] | undefined) ? (hero.media as string[]) : [];
    sectionMap.hero = (
      <HeroPreview
        title={(hero.title as string) || ""}
        subtitle={(hero.subtitle as string) || ""}
        description={(hero.description as string) || ""}
        ctaText={(hero.ctaText as string) || "Shop MONADATY"}
        ctaLink={(hero.ctaLink as string) || "/shop"}
        media={media}
      />
    );
  }

  if (featured?.enabled) {
    sectionMap.featured = (
      <FeaturedPreview
        title={(featured.title as string) || "Featured"}
        subtitle={(featured.subtitle as string) || "SELECTED FLAVORS"}
        products={safeProducts}
      />
    );
  }

  if (collectionHeader?.enabled) {
    sectionMap.collections = (
      <CollectionsPreview
        title={(collectionHeader.title as string) || "Shop by Collection"}
        subtitle={(collectionHeader.subtitle as string) || "THE COLLECTIONS"}
        collections={safeCollections.map((c) => ({
          slug: c?.slug || "",
          name: c?.name || "",
          image: c?.image || "",
        }))}
      />
    );
  }

  if (brandStory?.enabled) {
    sectionMap.about = (
      <BrandStoryPreview
        title={(brandStory.title as string) || "Our Story"}
        description={(brandStory.description as string) || ""}
        image={(brandStory.image as string) || ""}
      />
    );
  }

  if (testimonialHeader?.enabled) {
    sectionMap.testimonials = (
      <SocialProofPreview
        title={(testimonialHeader.title as string) || "Testimonials"}
        subtitle={(testimonialHeader.subtitle as string) || "WHAT THEY SAY"}
        testimonials={safeTestimonials}
      />
    );
  }

  if (moroccanMoment?.enabled) {
    sectionMap.moroccan_moment = (
      <MoroccanMomentPreview
        title={(moroccanMoment.title as string) || "Pour. Serve. Savor."}
        subtitle={(moroccanMoment.subtitle as string) || "THE MONADATY MOMENT"}
        description={(moroccanMoment.description as string) || ""}
        image={(moroccanMoment.image as string) || ""}
      />
    );
  }

  if (newsletter?.enabled) {
    sectionMap.newsletter = (
      <NewsletterPreview
        title={(newsletter.title as string) || "STAY IN THE MONADATY CIRCLE"}
        subtitle={(newsletter.subtitle as string) || "STAY CONNECTED"}
        description={(newsletter.description as string) || ""}
        placeholder={(newsletter.placeholder as string) || "Your email"}
        buttonText={(newsletter.buttonText as string) || "Join"}
      />
    );
  }

  if (finalCta?.enabled) {
    sectionMap.final_cta = (
      <FinalCtaPreview
        subtitle={(finalCta.subtitle as string) || "BEGIN THE POUR"}
        title={(finalCta.title as string) || "YOUR NEXT FAVORITE TASTE IS WAITING."}
        description={(finalCta.description as string) || ""}
        buttonText={(finalCta.buttonText as string) || "SHOP NOW"}
        buttonLink={(finalCta.buttonLink as string) || "/shop"}
      />
    );
  }

  return (
    <div className="bg-black min-h-full">
      {safeOrder.map((key) => sectionMap[key]).filter(Boolean)}
   </div>
  );
}
