"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import type { StoredCollection } from "@/types";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";

export function CollectionsClient({
  collections,
  saveCollection,
  deleteCollection,
}: {
  collections: StoredCollection[];
  saveCollection: (data: FormData) => void;
  deleteCollection: (data: FormData) => void;
}) {
  const { t } = useTranslation("admin");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const editing = editingSlug ? collections.find((collection) => collection.slug === editingSlug) ?? null : null;
  const editorOpen = editingSlug === "__new__" || Boolean(editing);

  function openEditor(slug: string | null) {
    setEditingSlug(slug);
    setImage(slug ? collections.find((collection) => collection.slug === slug)?.image ?? "" : "");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveCollection(new FormData(event.currentTarget));
      toast.success(t("collection_saved_success", "Collection saved successfully"));
      setEditingSlug(null);
    } catch {
      toast.error(t("collection_save_failed", "Failed to save collection"));
    }
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await deleteCollection(new FormData(event.currentTarget));
      toast.success(t("collection_deleted_success", "Collection deleted successfully"));
    } catch {
      toast.error(t("collection_delete_failed", "Failed to delete collection"));
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#0B0B0A]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 flex flex-col gap-4 border-b border-white/[0.06] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold/70">{t("catalog", "Catalog")}</p>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("collections", "Collections")}</h1>
            <p className="mt-2 text-sm text-white/45">{collections.length} {t("collections", "collections")}</p>
          </div>
          {!editorOpen && (
            <button type="button" onClick={() => openEditor("__new__")} className="btn-primary h-11 w-full px-5 text-[0.62rem] sm:w-auto">
              <span className="text-base font-light" aria-hidden>+</span>
              {t("add_collection", "Add Collection")}
            </button>
          )}
        </header>

        {editorOpen && (
          <section className="mb-7 overflow-hidden rounded-xl border border-white/[0.07] bg-[#121211] shadow-[0_16px_40px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex flex-col gap-2 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/70">{editingSlug === "__new__" ? t("new_collection", "New Collection") : t("edit_collection", "Edit Collection")}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{editingSlug === "__new__" ? t("create_collection", "Create a collection") : editing?.title}</h2>
              </div>
              <button type="button" onClick={() => setEditingSlug(null)} className="inline-flex h-9 items-center self-start rounded-md px-3 text-xs text-white/45 transition hover:bg-white/[0.04] hover:text-white sm:self-auto">{t("cancel", "Cancel")}</button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,420px)]">
              {editing && <input type="hidden" name="original" value={editing.slug} />}
              <div className="min-w-0 space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label={t("title_label", "Title")} name="title" defaultValue={editing?.title} required />
                  <Field label={t("slug_label", "Slug")} name="slug" defaultValue={editing?.slug} required />
                </div>
                <Field label={t("description_label", "Description")} name="description" defaultValue={editing?.description} rows={4} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_160px_140px]">
                  <Field label={t("preview_label", "Preview Label")} name="previewLabel" defaultValue={editing?.previewLabel} />
                  <Field label={t("accent_color", "Accent Color")} name="accent" defaultValue={editing?.accent || "#B89B5E"} type="color" />
                  <Field label={t("order_label", "Order")} name="order" type="number" defaultValue={editing?.order?.toString()} />
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setEditingSlug(null)} className="btn-secondary h-10 px-5 text-[0.6rem]">{t("cancel", "Cancel")}</button>
                  <button type="submit" className="btn-primary h-10 px-5 text-[0.6rem]">{editingSlug === "__new__" ? t("add_button", "Add") : t("update_button", "Update")}</button>
                </div>
              </div>

              <div className="min-w-0 border-t border-white/[0.06] pt-6 xl:border-s xl:border-t-0 xl:ps-6 xl:pt-0">
                <SingleImageUploader
                  label={t("collection_image", "Collection Image")}
                  value={image}
                  onChange={setImage}
                  folder="monadaty/collections"
                  fieldName="image"
                  className="[&>div]:max-h-64 [&_img]:h-56"
                />
                <p className="mt-3 text-xs leading-relaxed text-white/35">{t("collection_image_help", "Use a proportional, high-quality image. The storefront crop remains unchanged.")}</p>
              </div>
            </form>
          </section>
        )}

        {collections.length === 0 ? (
          <section className="rounded-xl border border-dashed border-white/[0.1] bg-[#121211] px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gold/60" aria-hidden>◇</div>
            <h2 className="mt-4 text-sm font-semibold text-white/80">{t("no_collections", "No collections yet")}</h2>
            <button type="button" onClick={() => openEditor("__new__")} className="btn-primary mt-5 h-10 px-5 text-[0.6rem]">{t("add_collection", "Add Collection")}</button>
          </section>
        ) : (
          <section aria-label={t("collections", "Collections")}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/50">{t("collection_list", "Collection list")}</h2>
              <span className="text-xs tabular-nums text-white/30">{collections.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {collections.map((collection) => (
                <article key={collection.slug} className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/[0.07] bg-[#121211] p-4 transition duration-300 hover:border-gold/20 sm:flex-row sm:items-center">
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0B0B0A] sm:h-20 sm:w-24">
                    {collection.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={collection.image} alt={collection.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-white/15" aria-hidden>◇</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/10" style={{ backgroundColor: collection.accent || "#B89B5E" }} aria-hidden />
                      <h3 className="truncate text-sm font-semibold text-white">{collection.title}</h3>
                    </div>
                    <p className="mt-1 truncate font-mono text-xs text-white/35">/{collection.slug}</p>
                    <p className="mt-2 line-clamp-1 text-xs text-white/45">{collection.description || t("no_description", "No description")}</p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] pt-3 sm:justify-end sm:border-s sm:border-t-0 sm:ps-4 sm:pt-0">
                    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/40">{t("order_label", "Order")} {collection.order}</span>
                    <button type="button" onClick={() => openEditor(collection.slug)} className="inline-flex h-9 items-center rounded-md border border-gold/20 px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-gold transition hover:bg-gold/10" aria-label={`${t("edit", "Edit")} ${collection.title}`}>{t("edit", "Edit")}</button>
                    <form onSubmit={handleDelete}>
                      <input type="hidden" name="slug" value={collection.slug} />
                      <button type="submit" className="inline-flex h-9 items-center rounded-md px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/40 transition hover:bg-burgundy/10 hover:text-red-300" aria-label={`${t("delete", "Delete")} ${collection.title}`}>{t("delete", "Delete")}</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  rows,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={`collection-${name}`} className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</label>
      {rows ? (
        <textarea id={`collection-${name}`} name={name} defaultValue={defaultValue} rows={rows} required={required} className="input-premium min-h-[112px] w-full resize-y py-3 leading-relaxed" />
      ) : (
        <input id={`collection-${name}`} name={name} type={type} defaultValue={defaultValue} required={required} className={`input-premium w-full ${type === "color" ? "cursor-pointer p-1.5" : ""}`} />
      )}
    </div>
  );
}
