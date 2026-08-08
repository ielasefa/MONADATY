"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { SafeImage } from "@/components/SafeImage";
import type { AdminShowcaseCollection } from "@/lib/db";
import type { SaveCollectionShowcaseResult } from "@/lib/actions/admin-collection-showcase";

const MAX_PRODUCTS = 3;

type Props = {
  collections: AdminShowcaseCollection[];
  saveCollectionShowcase: (formData: FormData) => Promise<SaveCollectionShowcaseResult>;
};

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-burgundy/30 bg-burgundy/10 px-4 py-3 text-sm font-medium text-burgundy">
      {message}
    </p>
  );
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-white">
      <SafeImage
        src={src}
        alt={alt}
        fill
        sizes="56px"
        className="object-contain p-1.5"
        fallback={<span className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400">{alt.charAt(0)}</span>}
      />
    </div>
  );
}

export function CollectionShowcaseClient({ collections, saveCollectionShowcase }: Props) {
  const { t } = useTranslation("admin");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickerId, setPickerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const [selection, setSelection] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const c of collections) {
      initial[c.id] = [...c.selection].sort((a, b) => a.position - b.position).map((s) => s.productId);
    }
    return initial;
  });

  const expanded = expandedId ? collections.find((c) => c.id === expandedId) ?? null : null;
  const selectedIds = expanded ? selection[expanded.id] ?? [] : [];

  const featuredCount = useMemo(
    () => Object.values(selection).reduce((sum, ids) => sum + ids.length, 0),
    [selection],
  );
  const configuredCount = useMemo(
    () => Object.values(selection).filter((ids) => ids.length === MAX_PRODUCTS).length,
    [selection],
  );

  const productById = useMemo(() => {
    const map = new Map<string, AdminShowcaseCollection["products"][number]>();
    for (const c of collections) {
      for (const p of c.products) map.set(p.id, p);
    }
    return map;
  }, [collections]);

  const toggle = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
    setPickerId(null);
    setSearch("");
  };

  const addProduct = (productId: string) => {
    if (!expanded) return;
    const current = selection[expanded.id] ?? [];
    if (current.length >= MAX_PRODUCTS) return;
    if (current.includes(productId)) return;
    setSelection((prev) => ({ ...prev, [expanded.id]: [...current, productId] }));
    setPickerId(null);
  };

  const removeProduct = (index: number) => {
    if (!expanded) return;
    const current = selection[expanded.id] ?? [];
    const next = current.filter((_, i) => i !== index);
    setSelection((prev) => ({ ...prev, [expanded.id]: next }));
  };

  const move = (index: number, direction: -1 | 1) => {
    if (!expanded) return;
    const current = selection[expanded.id] ?? [];
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    setSelection((prev) => ({ ...prev, [expanded.id]: next }));
  };

  const handleSave = async () => {
    if (!expanded) return;
    const ids = selection[expanded.id] ?? [];
    if (ids.length !== MAX_PRODUCTS) {
      toast.error(t("collection_showcase_exactly_three", "Please select exactly 3 products."));
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("collectionId", expanded.id);
      ids.forEach((id, i) => formData.set(`productId${i + 1}`, id));
      const result = await saveCollectionShowcase(formData);
      if (result.ok) {
        toast.success(t("collection_showcase_saved", "Collection showcase saved successfully"));
      } else {
        const message =
          result.code === "exactly_three"
            ? t("collection_showcase_exactly_three", "Please select exactly 3 products.")
            : result.code === "duplicate_products"
              ? t("collection_showcase_duplicate", "Each product can only be selected once.")
              : t("collection_showcase_save_failed", "Failed to save collection showcase");
        toast.error(message);
      }
    } catch {
      toast.error(t("collection_showcase_save_failed", "Failed to save collection showcase"));
    } finally {
      setSaving(false);
    }
  };

  const pickerProducts = useMemo(() => {
    if (!expanded) return [];
    const current = selection[expanded.id] ?? [];
    const available = expanded.products.filter((p) => !current.includes(p.id));
    const q = search.trim().toLowerCase();
    return q
      ? available.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
      : available;
  }, [expanded, selection, search]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="luxury-label mb-2">{t("collection_showcase_breadcrumb", "Collection Showcase")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {t("collection_showcase_title", "Collection Showcase Manager")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("collection_showcase_description", "Choose exactly 3 products to feature for each collection on the landing page.")}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="luxury-card rounded-xl px-5 py-3">
            <p className="luxury-label text-[10px] text-muted">{t("configured_collections", "Configured Collections")}</p>
            <p className="font-display text-xl font-semibold text-gold">
              {configuredCount} <span className="text-xs font-normal text-muted">/ {collections.length}</span>
            </p>
          </div>
          <div className="luxury-card rounded-xl px-5 py-3">
            <p className="luxury-label text-[10px] text-muted">{t("featured_products", "Featured Products")}</p>
            <p className="font-display text-xl font-semibold text-white">{featuredCount}</p>
          </div>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="luxury-card flex flex-col items-center gap-3 rounded-xl p-12 text-center">
          <span className="text-3xl">⊟</span>
          <p className="font-medium text-white">{t("collection_showcase_empty", "No collections found")}</p>
          <p className="max-w-sm text-sm text-muted">
            {t("collection_showcase_empty_desc", "Create a collection first to start curating its featured products.")}
          </p>
          <Link href="/admin/collections" className="btn-primary mt-2">
            {t("add_collection", "Add Collection")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => {
            const count = selection[c.id]?.length ?? 0;
            const isExpanded = expandedId === c.id;
            const complete = count === MAX_PRODUCTS;
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`luxury-card rounded-xl border p-5 text-left transition-all duration-300 ${
                  isExpanded
                    ? "border-gold/40 shadow-gold shadow-lg"
                    : "border-white/[0.06] hover:border-gold/25"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{c.slug}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${
                      complete
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-burgundy/10 text-burgundy"
                    }`}
                  >
                    {count} / {MAX_PRODUCTS}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {(selection[c.id] ?? []).slice(0, 3).map((pid) => {
                      const p = productById.get(pid);
                      return (
                        <div key={pid} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-[#171717] bg-white">
                          {p ? (
                            <SafeImage
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="36px"
                              className="object-contain p-0.5"
                              fallback={<span className="flex h-full w-full items-center justify-center text-[0.6rem] font-bold text-neutral-400">{p.name.charAt(0)}</span>}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs font-medium text-gold">
                    {count > 0 ? (
                      <span>
                        {t("products_configured", "Products configured")}{" "}
                        <span className="text-white/70">· {count} / 3</span>
                      </span>
                    ) : (
                      t("no_products_selected", "No products selected")
                    )}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="label-utility text-[0.6rem] tracking-[0.2em] text-gold/70">
                    {isExpanded ? t("close", "Close") : t("manage_products", "Manage Products")}
                  </span>
                  <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} className="text-muted">›</motion.span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            key={expanded.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="luxury-card mt-8 rounded-xl p-6 md:p-8"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="luxury-label mb-1">{t("selected_products", "Selected Products")}</p>
                <h2 className="text-xl font-semibold text-white">{expanded.name}</h2>
              </div>
              <span className="text-xs text-muted">
                {t("products_configured", "Products configured")} ·{" "}
                <span className="text-white/70">{selectedIds.length} / 3</span>
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {selectedIds.length === 0 && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.12] py-10 text-center">
                  <span className="text-2xl text-muted">⊞</span>
                  <p className="text-sm text-muted">{t("no_products_selected", "No products selected")}</p>
                </div>
              )}
              {selectedIds.map((pid, index) => {
                const product = productById.get(pid);
                if (!product) return null;
                return (
                  <motion.div
                    key={pid}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 text-[0.65rem] font-bold text-gold">
                      {index + 1}
                    </span>
                    <Thumb src={product.image} alt={product.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-gold">{product.price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={t("move_up", "Move up")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition hover:border-gold/40 hover:text-gold disabled:pointer-events-none disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === selectedIds.length - 1}
                        aria-label={t("move_down", "Move down")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition hover:border-gold/40 hover:text-gold disabled:pointer-events-none disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      aria-label={`${t("remove_product", "Remove Product")} ${product.name}`}
                      className="badge-red rounded-lg px-3 py-2 text-xs font-medium"
                    >
                      {t("remove_product", "Remove")}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {selectedIds.length < MAX_PRODUCTS && (
              <div className="mt-6">
                {pickerId === expanded.id ? (
                  <div className="rounded-xl border border-white/[0.08] bg-black-soft p-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("search_products", "Search products…")}
                        className="input-premium w-full px-4 py-2.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setPickerId(null)}
                        className="btn-secondary shrink-0 px-4 py-2.5 text-sm"
                      >
                        {t("cancel", "Cancel")}
                      </button>
                    </div>
                    <div className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                      {pickerProducts.length === 0 && (
                        <p className="col-span-full py-6 text-center text-sm text-muted">{t("no_results", "No results")}</p>
                      )}
                      {pickerProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p.id)}
                          className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-card p-3 text-left transition hover:border-gold/30"
                        >
                          <Thumb src={p.image} alt={p.name} />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white">{p.name}</p>
                            <p className="text-xs text-muted">{p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPickerId(expanded.id)}
                    className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
                  >
                    <span className="text-gold">+</span> {t("add_product", "Add Product")}
                  </button>
                )}
              </div>
            )}

            {selectedIds.length < MAX_PRODUCTS && (
              <div className="mt-5">
                <ErrorMessage
                  message={t("collection_showcase_exactly_three", "Please select exactly 3 products.")}
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/[0.06] pt-6">
              <Link href="/admin/collections" className="btn-secondary rounded-xl px-4 py-2.5 text-sm">
                {t("edit_collections", "Edit Collections")}
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || selectedIds.length !== MAX_PRODUCTS}
                className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm disabled:pointer-events-none disabled:opacity-50"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                )}
                {t("save", "Save")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
