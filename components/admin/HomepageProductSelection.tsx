"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type Product = { id: string; name: string; image: string; price: string };
const copy = {
  fr: { title: "Produits populaires", description: "Choisissez les quatre produits affichés sur la page d’accueil. L’ordre des emplacements définit leur ordre d’affichage.", slot: "Emplacement", choose: "Choisir un produit", count: "produits sélectionnés", save: "Enregistrer la sélection", saving: "Enregistrement…", success: "Les quatre produits ont été enregistrés.", invalid: "Choisissez quatre produits différents.", unavailable: "Un produit n’est plus disponible. Modifiez la sélection.", failed: "La sélection n’a pas été enregistrée. Réessayez.", conflict: "La sélection a été modifiée entre-temps. Rechargez la page et réessayez.", storefront: "Voir la boutique", settings: "Paramètres du site" },
  en: { title: "Popular products", description: "Choose the four products shown on the homepage. Slot order determines their display order.", slot: "Slot", choose: "Choose a product", count: "products selected", save: "Save selection", saving: "Saving…", success: "All four products have been saved.", invalid: "Choose four different products.", unavailable: "A product is no longer available. Update your selection.", failed: "The selection could not be saved. Please try again.", conflict: "The selection changed while you were editing. Reload and try again.", storefront: "View storefront", settings: "Site settings" },
  ar: { title: "المنتجات الرائجة", description: "اختر المنتجات الأربعة التي تظهر في الصفحة الرئيسية. يحدد ترتيب الخانات ترتيب عرضها.", slot: "الخانة", choose: "اختر منتجاً", count: "منتجات مختارة", save: "حفظ الاختيارات", saving: "جارٍ الحفظ…", success: "تم حفظ المنتجات الأربعة.", invalid: "اختر أربعة منتجات مختلفة.", unavailable: "أحد المنتجات لم يعد متوفراً. حدّث اختياراتك.", failed: "تعذّر حفظ الاختيارات. حاول مرة أخرى.", conflict: "تغيرت الاختيارات أثناء التعديل. أعد تحميل الصفحة وحاول مجدداً.", storefront: "عرض المتجر", settings: "إعدادات الموقع" },
};

export function HomepageProductSelection({ products, productIds }: { products: Product[]; productIds: string[] }) {
  const { lang } = useTranslation("admin");
  const labels = copy[lang];
  const router = useRouter();
  const [selected, setSelected] = useState(() => Array.from({ length: 4 }, (_, index) => productIds[index] || ""));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const count = selected.filter(Boolean).length;
  const complete = count === 4 && new Set(selected).size === 4;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete || saving) return;
    setSaving(true); setFeedback(null);
    try {
      const response = await fetch("/api/admin/landing/featured-products", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selected }),
      });
      const result = await response.json();
      if (!response.ok) {
        const text = result.error === "PRODUCTS_UNAVAILABLE" ? labels.unavailable : result.error === "SAVE_CONFLICT" ? labels.conflict : result.error === "SELECT_FOUR_PRODUCTS" ? labels.invalid : labels.failed;
        setFeedback({ error: true, text }); return;
      }
      setFeedback({ error: false, text: labels.success }); router.refresh();
    } catch { setFeedback({ error: true, text: labels.failed }); }
    finally { setSaving(false); }
  }

  return (
    <div className="container-shell">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div><h1>{labels.title}</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-secondary">{labels.description}</p></div>
        <Link href="/" className="btn-secondary">{labels.storefront}</Link>
      </div>
      <form onSubmit={save} className="admin-panel p-4 sm:p-6" aria-busy={saving}>
        <p className="mb-6 text-sm text-secondary" aria-live="polite">{count} / 4 {labels.count}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {selected.map((id, index) => {
            const product = products.find(item => item.id === id);
            return (
              <div key={index} className="rounded-xl border border-line bg-canvas p-4">
                <label htmlFor={"featured-slot-" + index} className="mb-3 block text-sm font-semibold">{labels.slot} {index + 1}</label>
                <select id={"featured-slot-" + index} value={id} disabled={saving} required className="admin-input w-full px-3"
                  onChange={event => { setSelected(current => current.map((value, position) => position === index ? event.target.value : value)); setFeedback(null); }}
                >
                  <option value="">{labels.choose}</option>
                  {products.map(item => <option key={item.id} value={item.id} disabled={item.id !== id && selected.includes(item.id)}>{item.name}</option>)}
                </select>
                {product && <div className="mt-4 flex items-center gap-4"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white"><SafeImage src={product.image} alt={product.name} fill sizes="80px" className="object-contain p-2" /></div><div className="min-w-0"><p className="text-sm font-medium">{product.name}</p><p className="mt-1 text-sm text-accent">{product.price}</p></div></div>}
              </div>
            );
          })}
        </div>
        {feedback && <p role={feedback.error ? "alert" : "status"} className={"mt-6 rounded-lg border px-4 py-3 text-sm " + (feedback.error ? "border-red-400/40 text-red-700" : "border-line text-foreground")}>{feedback.text}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-4"><button type="submit" disabled={!complete || saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">{saving ? labels.saving : labels.save}</button><Link href="/admin/settings" className="text-sm text-secondary underline underline-offset-4">{labels.settings}</Link></div>
      </form>
    </div>
  );
}
