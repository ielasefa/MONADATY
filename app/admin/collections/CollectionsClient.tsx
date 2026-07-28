"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { StoredCollection } from "@/types";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";

export function CollectionsClient({
  collections,
  saveCollection,
  deleteCollection,
}: {
  collections: StoredCollection[];
  saveCollection: (d: FormData) => void;
  deleteCollection: (d: FormData) => void;
}) {
  const { t } = useTranslation("admin");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const editing = editingSlug ? collections.find((c) => c.slug === editingSlug) ?? null : null;

  return (
    <div>
      <div className="mb-8">
        <p className="luxury-label mb-2">Catalog</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("collections")}</h1>
        <p className="mt-1 text-sm text-muted">{collections.length} collections</p>
      </div>

      {(editingSlug === "__new__" || editing) && (
        <div className="mb-8 luxury-card p-8">
          <h2 className="luxury-label mb-4">
            {editingSlug === "__new__" ? "New Collection" : `Edit: ${editing?.title}`}
          </h2>
          <form action={saveCollection} className="space-y-4">
            {editing && <input type="hidden" name="original" value={editing.slug} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("title_label")} name="title" defaultValue={editing?.title} />
              <Field label="Slug" name="slug" defaultValue={editing?.slug} />
            </div>
            <Field label={t("description_label")} name="description" defaultValue={editing?.description} rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Accent Color" name="accent" defaultValue={editing?.accent || "#D5B87D"} type="color" />
              <Field label="Preview Label" name="previewLabel" defaultValue={editing?.previewLabel} />
            </div>
            <SingleImageUploader label="Collection Image" value={editing?.image || ""} onChange={(_url) => {}} folder="monadaty/collections" />
            <input type="hidden" name="image" defaultValue={editing?.image || ""} />
            <Field label={t("order_label")} name="order" type="number" defaultValue={editing?.order?.toString()} />
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">
                {editingSlug === "__new__" ? t("add_button") : t("update_button")}
              </button>
              <button type="button" onClick={() => setEditingSlug(null)} className="btn-secondary">{t("cancel")}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((c) => (
          <div key={c.slug} className="luxury-card flex items-center gap-4 p-5">
            <div className="flex-1">
              <p className="font-medium text-white">{c.title}</p>
              <p className="text-sm text-muted">{c.slug} &middot; Order: {c.order}</p>
            </div>
            <button
              onClick={() => setEditingSlug(c.slug)}
              className="text-sm font-medium text-gold hover:text-gold/80 transition-colors"
              aria-label={`Edit ${c.title}`}
            >
              Edit
            </button>
            <form action={deleteCollection}>
              <input type="hidden" name="slug" value={c.slug} />
              <button type="submit" className="badge-red" aria-label={`Delete ${c.title}`}>{t("delete")}</button>
            </form>
          </div>
        ))}
      </div>

      {editingSlug === null && (
        <button
          onClick={() => setEditingSlug("__new__")}
          className="btn-primary mt-6"
        >
          + Add Collection
        </button>
      )}
    </div>
  );
}

function Field({ label, name, defaultValue, type, rows }: { label: string; name: string; defaultValue?: string; type?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <label className="luxury-label">{label}</label>
      {rows ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} className="input-premium w-full px-4 py-3 min-h-[80px] resize-y" />
      ) : (
        <input name={name} type={type || "text"} defaultValue={defaultValue} className="input-premium w-full px-4 py-2.5" />
      )}
    </div>
  );
}
