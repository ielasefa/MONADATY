"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { StoredArticle } from "@/types";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";

export function BlogClient({
  articles,
  saveArticle,
  deleteArticle,
}: {
  articles: StoredArticle[];
  saveArticle: (d: FormData) => void;
  deleteArticle: (d: FormData) => void;
}) {
  const { t } = useTranslation("admin");
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = editingId ? articles.find((a) => a.id === editingId) ?? null : null;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">{t("content")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("blog")}</h1>
          <p className="mt-1 text-sm text-muted">{articles.length} articles</p>
        </div>
        <button
          onClick={() => setEditingId("__new__")}
          className="btn-primary"
        >
          {t("new_article")}
        </button>
      </div>

      {(editingId === "__new__" || editing) && (
        <div className="mb-8 luxury-card p-8">
          <h2 className="luxury-label mb-4">
            {editingId === "__new__" ? "New Article" : `Edit: ${editing?.title}`}
          </h2>
          <form action={saveArticle} className="space-y-5">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("title_label")} name="title" defaultValue={editing?.title} />
              <Field label="Slug" name="slug" defaultValue={editing?.slug} />
            </div>
            <Field label="Content" name="content" defaultValue={editing?.content} rows={6} />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Author" name="author" defaultValue={editing?.author} />
              <SingleImageUploader label="Cover Image" value={editing?.coverImage || ""} // eslint-disable-next-line @typescript-eslint/no-unused-vars
onChange={(_url) => {}} folder="monadaty/blog" />
              <input type="hidden" name="coverImage" defaultValue={editing?.coverImage || ""} />
              <Field label="Publish Date" name="publishDate" type="date" defaultValue={editing?.publishDate?.slice(0, 10)} />
            </div>
            <Field label="Tags (comma separated)" name="tags" defaultValue={editing?.tags?.join(", ")} />
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer pt-6">
                <input type="hidden" name="published" value="false" />
                <input type="checkbox" name="published" value="true" defaultChecked={editing?.published} className="h-4 w-4 rounded border-white/20 accent-red" /> <span className="text-sm text-muted">Published</span>
              </label>
              <Field label={t("order_label")} name="order" type="number" defaultValue={editing?.order?.toString()} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">
                {editingId === "__new__" ? "Create Article" : "Update Article"}
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="btn-secondary">{t("cancel")}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {articles.map((a) => (
          <div key={a.id} className="luxury-card flex items-center gap-4 p-5">
            <div className="flex-1">
              <p className="font-medium text-white">{a.title}</p>
              <p className="text-sm text-muted">
                {a.published ? <span className="badge-emerald mr-2">Published</span> : <span className="badge-red mr-2">Draft</span>}
                {a.author || "No author"} &middot; {a.publishDate?.slice(0, 10)}
              </p>
            </div>
            <button
              onClick={() => setEditingId(a.id)}
              className="text-sm font-medium text-gold hover:text-gold/80 transition-colors"
              aria-label={`Edit ${a.title}`}
            >
              Edit
            </button>
            <form action={deleteArticle}>
              <input type="hidden" name="id" value={a.id} />
              <button type="submit" className="badge-red" aria-label={`Delete ${a.title}`}>{t("delete")}</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, name, defaultValue, type, rows }: { label: string; name: string; defaultValue?: string; type?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <label className="luxury-label">{label}</label>
      {rows ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} className="input-premium w-full px-4 py-3 min-h-[120px] resize-y" />
      ) : (
        <input name={name} type={type || "text"} defaultValue={defaultValue} className="input-premium w-full px-4 py-2.5" />
      )}
    </div>
  );
}
