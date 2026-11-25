"use client";

import { useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const copy = {
  fr: { remove: "Retirer une unité du stock", add: "Ajouter une unité au stock", pending: "Enregistrement…", retry: "Réessayer", refresh: "Actualiser", failed: "Modification non confirmée. Réessayez pour vérifier la même opération.", empty: "Le stock disponible est insuffisant.", limit: "La limite du stock est atteinte." },
  en: { remove: "Remove one unit from stock", add: "Add one unit to stock", pending: "Saving…", retry: "Retry", refresh: "Refresh", failed: "Adjustment not confirmed. Retry to check the same operation.", empty: "Not enough available stock.", limit: "The stock limit has been reached." },
  ar: { remove: "إنقاص وحدة من المخزون", add: "إضافة وحدة إلى المخزون", pending: "جارٍ الحفظ…", retry: "إعادة المحاولة", refresh: "تحديث", failed: "لم يتم تأكيد التعديل. أعد المحاولة للتحقق من نفس العملية.", empty: "المخزون المتوفر غير كافٍ.", limit: "تم بلوغ الحد الأقصى للمخزون." },
};

function operationId() {
  return globalThis.crypto?.randomUUID?.() ?? "10000000-1000-4000-8000-100000000000".replace(/[018]/g, value => (Number(value) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(value) / 4).toString(16));
}

export function ProductStockControl({ product, onUpdated, onRefresh }: { product: { id: string; name: string; stock: number }; onUpdated: (id: string, stock: number) => void; onRefresh: () => void }) {
  const { lang } = useTranslation("admin");
  const labels = copy[lang];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const operation = useRef<{ delta: number; operationId: string } | null>(null);
  const inFlight = useRef(false);

  async function adjust(delta: number) {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    const request = operation.current ?? { delta, operationId: operationId() };
    operation.current = request;
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}/stock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          operation.current = null;
          onRefresh();
          setError(data.code === "OUT_OF_STOCK" ? labels.empty : data.code === "STOCK_LIMIT" ? labels.limit : labels.failed);
        } else setError(labels.failed);
        return;
      }
      operation.current = null;
      onUpdated(product.id, data.product.stock);
    } catch { setError(labels.failed); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return <div className="mt-2" data-stock-control={product.id}>
    <div className="flex items-center justify-center gap-1">
      <button type="button" onClick={() => adjust(-1)} disabled={busy || !!operation.current || product.stock <= 0} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-brand disabled:cursor-not-allowed disabled:opacity-35" aria-label={`${labels.remove} — ${product.name}`} title={labels.remove}>−</button>
      <button type="button" onClick={() => adjust(1)} disabled={busy || !!operation.current || product.stock >= 2147483647} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-brand disabled:cursor-not-allowed disabled:opacity-35" aria-label={`${labels.add} — ${product.name}`} title={labels.add}>+</button>
    </div>
    {busy && <p role="status" className="mt-1 text-center text-xs text-secondary">{labels.pending}</p>}
    {error && <div role="alert" className="mt-2 max-w-64 text-start text-xs text-red-700"><p>{error}</p><div className="flex flex-wrap gap-3">{operation.current && <button type="button" disabled={busy} onClick={() => adjust(operation.current!.delta)} className="font-semibold text-brand">{labels.retry}</button>}<button type="button" onClick={() => { operation.current = null; setError(""); onRefresh(); }} className="font-semibold text-brand">{labels.refresh}</button></div></div>}
  </div>;
}
