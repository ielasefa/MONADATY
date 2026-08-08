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
   saveCategory: (d: FormData) => void;
   deleteCategory: (d: FormData) => void;
 }) {
  const { t } = useTranslation("admin");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [image, setImage] = useState("");

  const editing = editingSlug ? categories.find((c) => c.slug === editingSlug) ?? null : null;

  const openEditor = (slug: string | null) => {
    setEditingSlug(slug);
    setImage(slug ? (categories.find((c) => c.slug === slug)?.image ?? "") : "");
  };
 
   const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     try {
       await saveCategory(formData);
       toast.success(t("category_saved_success", "Category saved successfully"));
       setEditingSlug(null);
     } catch {
       toast.error(t("category_save_failed", "Failed to save category"));
     }
   };
 
   const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const formData = new FormData(e.currentTarget);
     try {
       await deleteCategory(formData);
       toast.success(t("category_deleted_success", "Category deleted successfully"));
     } catch {
       toast.error(t("category_delete_failed", "Failed to delete category"));
     }
   };

  return (
    <div>
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("catalog")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("categories")}</h1>
        <p className="mt-1 text-sm text-muted">{categories.length} categories</p>
      </div>

      {(editingSlug === "__new__" || editing) && (
<div className="mb-8 luxury-card p-8">
  <h2 className="luxury-label mb-4">
    {editingSlug === "__new__" ? t("new_category", "New Category") : `${t("edit")}: ${editing?.name}`}
  </h2>
          <form onSubmit={handleSave} className="space-y-4">
            {editing && <input type="hidden" name="original" value={editing.slug} />}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("name_label")} name="name" defaultValue={editing?.name} />
              <Field label={t("slug_label")} name="slug" defaultValue={editing?.slug} />
            </div>
            <Field label={t("description_label")} name="description" defaultValue={editing?.description} rows={2} />
            <SingleImageUploader label={t("category_image")} value={image} onChange={setImage} folder="monadaty/categories" fieldName="image" />
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary">
                {editingSlug === "__new__" ? t("add_button") : t("update_button")}
              </button>
              <button type="button" onClick={() => setEditingSlug(null)} className="btn-secondary">
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.slug} className="luxury-card flex items-center gap-4 p-5">
<div className="flex-1">
  <p className="font-medium text-white">{c.name}</p>
  <p className="text-sm text-white/50">{c.slug}</p>
</div>
            <button
              onClick={() => openEditor(c.slug)}
              className="text-sm font-medium text-gold hover:text-gold/80 transition-colors"
              aria-label={`${t("edit")} ${c.name}`}
            >
              {t("edit")}
            </button>
            <form onSubmit={handleDelete} className="flex items-center gap-2">
              <input type="hidden" name="slug" value={c.slug} />
              <label className="text-xs text-muted">{t("reassign_to")}:</label>
              <select name="replacement" className="input-premium h-12 px-3 text-xs" aria-label={t("replacement_category")}>
                <option value="">{t("delete_products_warning")}</option>
                {categories.filter((cat) => cat.slug !== c.slug).map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
              <button type="submit" className="badge-red ml-2" aria-label={`Delete ${c.name}`}>{t("delete")}</button>
            </form>
          </div>
        ))}
      </div>

      {editingSlug === null && (
        <button
          onClick={() => openEditor("__new__")}
          className="btn-primary mt-6"
        >
          + {t("add_category", "Add Category")}
        </button>
      )}
    </div>
  );
}

function Field({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <label className="luxury-label">{label}</label>
      {rows ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} className="input-premium w-full px-4 py-3 min-h-[80px] resize-y" />
      ) : (
        <input name={name} defaultValue={defaultValue} className="input-premium w-full px-4 py-2.5" />
      )}
    </div>
  );
}
