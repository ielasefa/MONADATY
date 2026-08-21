"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import type { StoredCategory } from "@/types";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";

export function CategoriesClient({
  categories,
  saveCategory,
  deleteCategory,
}: {
  categories: StoredCategory[];
  saveCategory: (data: FormData) => void;
  deleteCategory: (data: FormData) => void;
}) {
  const { t } = useTranslation("admin");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const editing = editingSlug ? categories.find((category) => category.slug === editingSlug) ?? null : null;
  const editorOpen = editingSlug === "__new__" || Boolean(editing);

  function openEditor(slug: string | null) {
    setEditingSlug(slug);
    setImage(slug ? categories.find((category) => category.slug === slug)?.image ?? "" : "");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveCategory(new FormData(event.currentTarget));
      toast.success(t("category_saved_success", "Category saved successfully"));
      setEditingSlug(null);
    } catch {
      toast.error(t("category_save_failed", "Failed to save category"));
    }
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await deleteCategory(new FormData(event.currentTarget));
      toast.success(t("category_deleted_success", "Category deleted successfully"));
    } catch {
      toast.error(t("category_delete_failed", "Failed to delete category"));
    }
  }

  return (
    <div className="min-w-0">
      <header className="mb-6 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="luxury-label text-[#D6B35A]/75">{t("catalog", "Catalog")}</p>
          <h1 className="mt-2 text-white">{t("categories", "Categories")}</h1>
          <p className="mt-1.5 text-sm text-white/45">{categories.length} {t("categories", "categories")}</p>
        </div>
        {!editorOpen ? (
          <button type="button" onClick={() => openEditor("__new__")} className="btn-primary w-full px-5 sm:w-auto">
            <span className="text-base font-normal" aria-hidden>+</span>
            {t("add_category", "Add category")}
          </button>
        ) : null}
      </header>

      {editorOpen ? (
        <section className="admin-panel mb-6 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="luxury-label text-[#D6B35A]/75">{editingSlug === "__new__" ? t("new_category", "New category") : t("edit", "Edit category")}</p>
              <h2 className="mt-1 truncate text-base font-semibold text-white">{editing?.name || t("create_category", "Create a category")}</h2>
            </div>
            <button type="button" onClick={() => setEditingSlug(null)} className="inline-flex h-9 items-center rounded-lg px-3 text-xs text-white/45 transition hover:bg-white/[0.04] hover:text-white">
              {t("cancel", "Cancel")}
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            {editing ? <input type="hidden" name="original" value={editing.slug} /> : null}
            <div className="min-w-0 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("name_label", "Name")} name="name" defaultValue={editing?.name} />
                <Field label={t("slug_label", "Slug")} name="slug" defaultValue={editing?.slug} />
              </div>
              <Field label={t("description_label", "Description")} name="description" defaultValue={editing?.description} rows={4} />
              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setEditingSlug(null)} className="btn-secondary px-5">{t("cancel", "Cancel")}</button>
                <button type="submit" className="btn-primary px-5">{editingSlug === "__new__" ? t("add_button", "Create") : t("update_button", "Update")}</button>
              </div>
            </div>
            <div className="min-w-0 border-t border-white/[0.08] pt-6 xl:border-s xl:border-t-0 xl:ps-6 xl:pt-0">
              <SingleImageUploader
                label={t("category_image", "Category image")}
                value={image}
                onChange={setImage}
                folder="categories"
                fieldName="image"
                className="[&>div]:max-h-64 [&_img]:h-56"
              />
            </div>
          </form>
        </section>
      ) : null}

      {categories.length === 0 ? (
        <section className="admin-panel border-dashed px-6 py-16 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-[#D6B35A]" aria-hidden>⊞</div>
          <h2 className="mt-4 text-sm font-semibold text-white/85">{t("no_categories", "No categories yet")}</h2>
          <button type="button" onClick={() => openEditor("__new__")} className="btn-primary mt-5 px-5">{t("add_category", "Add category")}</button>
        </section>
      ) : (
        <section aria-label={t("categories", "Categories")}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="luxury-label">{t("category_list", "Category list")}</h2>
            <span className="text-xs tabular-nums text-white/30">{categories.length}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {categories.map((category) => (
              <article key={category.slug} className="admin-panel flex min-w-0 flex-col gap-4 p-4 transition-colors duration-200 hover:border-[#D6B35A]/20 sm:flex-row sm:items-center">
                <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B0B0A] sm:w-24">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-white/15" aria-hidden>⊞</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{category.name}</h3>
                  <p className="mt-1 truncate font-mono text-xs text-white/35">/{category.slug}</p>
                  <p className="mt-2 line-clamp-1 text-xs text-white/45">{category.description || t("no_description", "No description")}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-2 border-t border-white/[0.08] pt-3 sm:w-[248px] sm:border-s sm:border-t-0 sm:ps-4 sm:pt-0">
                  <button type="button" onClick={() => openEditor(category.slug)} className="admin-secondary h-9 w-full px-3" aria-label={`${t("edit", "Edit")} ${category.name}`}>
                    {t("edit", "Edit")}
                  </button>
                  <form onSubmit={handleDelete} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <input type="hidden" name="slug" value={category.slug} />
                    <select name="replacement" className="min-w-0 px-3 text-xs" aria-label={t("replacement_category", "Replacement category")}>
                      <option value="">{t("delete_products_warning", "Delete products")}</option>
                      {categories.filter((item) => item.slug !== category.slug).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                    </select>
                    <button type="submit" className="inline-flex h-[42px] items-center rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-red-300 transition hover:bg-red-500/10" aria-label={`${t("delete", "Delete")} ${category.name}`}>
                      {t("delete", "Delete")}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={`category-${name}`} className="luxury-label">{label}</label>
      {rows ? (
        <textarea id={`category-${name}`} name={name} defaultValue={defaultValue} rows={rows} className="input-premium min-h-[112px] w-full resize-y px-4 py-3 leading-relaxed" />
      ) : (
        <input id={`category-${name}`} name={name} defaultValue={defaultValue} className="input-premium w-full px-4" />
      )}
    </div>
  );
}
