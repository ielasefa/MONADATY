"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (category: { id: string; name: string; slug: string }) => void;
};

export function CategoryCreateModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation("admin");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const generateSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create category");
        return;
      }
      onCreated(data.category);
      setName("");
      setSlug("");
      onClose();
    } catch {
      setError(t("network_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={t("create_category")}
    >
      <div className="w-full max-w-md rounded-xl border border-white/[0.06] bg-[#141414] p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("create_category")}</h2>
          <button onClick={onClose} className="text-white/50 transition hover:text-white" aria-label={t("close")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
              {t("name")}
            </label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-md border border-white/[0.06] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition focus:border-yellow/30"
              placeholder={t("category_name_placeholder")}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="cat-slug" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
              {t("slug")}
            </label>
            <input
              id="cat-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(generateSlug(e.target.value))}
              className="w-full rounded-md border border-white/[0.06] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none transition focus:border-yellow/30"
              placeholder={t("category_slug_placeholder")}
              required
            />
          </div>
          {error && <p className="text-xs text-red">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary h-10 rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em]">
              {t("cancel")}
           </button>
            <button type="submit" disabled={loading} className="btn-gold h-10 rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50">
              {loading ? t("creating") : t("create")}
        </button>
      </div>
        </form>
      </div>
    </div>
  );
}
