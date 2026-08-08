"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

const NAMESPACES = [
  "common", "navbar", "footer", "home", "products", "collections",
  "categories", "checkout", "cart", "orders", "account", "auth",
  "dashboard", "reports", "inventory", "automation", "security",
  "emails", "notifications", "landing", "validation",
  "errors", "buttons", "forms", "messages", "admin", "invoice",
  "shipping", "crm", "marketing", "system",
];

type TranslationRow = {
  id: string;
  key: string;
  namespace: string;
  fr: string;
  en: string;
  ar: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
};

type Stats = {
  total: number;
  fr: { translated: number; missing: number; coverage: number };
  en: { translated: number; missing: number; coverage: number };
  ar: { translated: number; missing: number; coverage: number };
  namespaces: { namespace: string; count: number }[];
};

export default function AdminTranslationsPage() {
  const { t } = useTranslation("admin");
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [namespace, setNamespace] = useState("");
  const [search, setSearch] = useState("");
  const [missing, setMissing] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ fr: string; en: string; ar: string }>({ fr: "", en: "", ar: "" });
  const [newKey, setNewKey] = useState("");
  const [newNamespace, setNewNamespace] = useState("common");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTranslations = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (namespace) params.set("namespace", namespace);
    if (search) params.set("search", search);
    if (missing) params.set("missing", missing);
    params.set("limit", "200");

    const res = await fetch(`/api/admin/translations?${params}`);
    if (res.ok) {
      const json = await res.json();
      setTranslations(json.rows || []);
    }
    setLoading(false);
  }, [namespace, search, missing]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/translations?stats=true");
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => { fetchTranslations(); fetchStats(); }, [fetchTranslations, fetchStats]);

  const handleSave = async (id: string) => {
    setSaving(true);
    const res = await fetch("/api/admin/translations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: editValues }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("translation_update_failed", "Failed to update translation"));
      return;
    }
    setEditingId(null);
    fetchTranslations();
    fetchStats();
    toast.success(t("translation_updated_success", "Translation saved"));
  };

  const handleCreate = async () => {
    if (!newKey.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert",
        data: { key: newKey.trim(), namespace: newNamespace },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(t("translation_create_failed", "Failed to create translation"));
      return;
    }
    setNewKey("");
    setShowNew(false);
    fetchTranslations();
    fetchStats();
    toast.success(t("translation_created_success", "Translation created"));
  };

   const handleDelete = async (id: string) => {
     const res = await fetch("/api/admin/translations", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ action: "delete", id }),
     });
     if (!res.ok) {
       toast.error(t("translation_delete_failed", "Failed to delete translation"));
       return;
     }
     fetchTranslations();
     fetchStats();
     toast.success(t("translation_deleted", "Translation deleted successfully"));
   };

  const handleExport = async () => {
    const res = await fetch("/api/admin/translations?limit=10000");
    const json = await res.json();
    const blob = new Blob([JSON.stringify(json.rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let items;
    try { items = JSON.parse(text); } catch {
      toast.error(t("invalid_json"));
      return;
    }
    if (!Array.isArray(items)) items = [items];
    const res = await fetch("/api/admin/translations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", items }),
    });
    if (res.ok) {
      toast.success(t("translations_imported", { count: items.length }));
      fetchTranslations();
      fetchStats();
    } else {
      toast.error(t("translation_import_failed", "Failed to import translations"));
    }
    e.target.value = "";
  };

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">{t("content")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("translations")}</h1>
          <p className="mt-1 text-sm text-muted">{t("translation_description")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowNew(!showNew)} className="btn-primary text-xs">{t("add_key")}</button>
          <button onClick={handleExport} className="btn-secondary text-xs">{t("export")}</button>
          <label className="btn-secondary inline-flex cursor-pointer items-center text-xs">
            {t("import")}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-card border border-white/[0.06] bg-card p-4">
            <p className="text-[10px] text-muted">{t("total_keys")}</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-card border border-white/[0.06] bg-card p-4">
            <p className="text-[10px] text-muted">{t("french")}</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.fr.coverage}%</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${stats.fr.coverage}%` }} />
            </div>
          </div>
          <div className="rounded-card border border-white/[0.06] bg-card p-4">
            <p className="text-[10px] text-muted">{t("english")}</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.en.coverage}%</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${stats.en.coverage}%` }} />
            </div>
          </div>
          <div className="rounded-card border border-white/[0.06] bg-card p-4">
            <p className="text-[10px] text-muted">{t("arabic")}</p>
            <p className="mt-1 text-xl font-semibold text-white">{stats.ar.coverage}%</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold" style={{ width: `${stats.ar.coverage}%` }} />
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="mb-6 rounded-card border border-white/[0.06] bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">{t("create_translation_key")}</h3>
          <div className="flex gap-3">
            <input
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder={t("translation_key_placeholder")}
              className="input-premium flex-1 px-3 py-2 text-sm"
            />
            <select
              value={newNamespace}
              onChange={e => setNewNamespace(e.target.value)}
              className="input-premium px-3 py-2 text-sm"
            >
              {NAMESPACES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={handleCreate} disabled={saving} className="btn-primary text-xs">
              {saving ? t("saving") : t("create")}
            </button>
            <button onClick={() => setShowNew(false)} className="btn-secondary text-xs">{t("cancel")}</button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={namespace}
          onChange={e => setNamespace(e.target.value)}
          className="input-premium px-3 py-1.5 text-xs"
        >
          <option value="">{t("all_namespaces")}</option>
          {NAMESPACES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("search_keys")}
          className="input-premium flex-1 px-3 py-1.5 text-xs min-w-[200px]"
        />
        <select
          value={missing}
          onChange={e => setMissing(e.target.value)}
          className="input-premium px-3 py-1.5 text-xs"
        >
          <option value="">{t("all_status")}</option>
          <option value="fr">{t("missing_french")}</option>
          <option value="en">{t("missing_english")}</option>
          <option value="ar">{t("missing_arabic")}</option>
        </select>
        <button onClick={() => { fetchTranslations(); fetchStats(); }} className="btn-secondary text-xs">{t("refresh")}</button>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-card bg-white/[0.04]" /> : (
        <div className="overflow-x-auto rounded-card border border-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs text-muted">
                <th className="px-4 py-3 font-medium">{t("key_label")}</th>
                <th className="px-4 py-3 font-medium">{t("namespace_label")}</th>
                <th className="px-4 py-3 font-medium">{t("french")}</th>
                <th className="px-4 py-3 font-medium">{t("english")}</th>
                <th className="px-4 py-3 font-medium" dir="rtl">{t("arabic")}</th>
                <th className="px-4 py-3 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {translations.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                  {editingId === row.id ? (
                    <>
                      <td className="px-4 py-2 text-xs text-gold font-mono">{row.key}</td>
                      <td className="px-4 py-2 text-xs text-muted">{row.namespace}</td>
                      <td className="px-4 py-2">
                        <input
                          value={editValues.fr}
                          onChange={e => setEditValues(prev => ({ ...prev, fr: e.target.value }))}
                          className="input-premium w-full px-2 py-1 text-xs"
                          dir="ltr"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editValues.en}
                          onChange={e => setEditValues(prev => ({ ...prev, en: e.target.value }))}
                          className="input-premium w-full px-2 py-1 text-xs"
                          dir="ltr"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editValues.ar}
                          onChange={e => setEditValues(prev => ({ ...prev, ar: e.target.value }))}
                          className="input-premium w-full px-2 py-1 text-xs"
                          dir="rtl"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-1">
                          <button onClick={() => handleSave(row.id)} disabled={saving} className="text-xs font-semibold text-gold hover:text-gold/80">{t("save")}</button>
                          <button onClick={() => setEditingId(null)} className="text-xs font-semibold text-muted hover:text-white">{t("cancel")}</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-xs text-gold font-mono">{row.key}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">{row.namespace}</td>
                      <td className={`px-4 py-2.5 text-xs ${row.fr ? "text-white/80" : "text-burgundy/50 italic"}`}>{row.fr || "—"}</td>
                      <td className={`px-4 py-2.5 text-xs ${row.en ? "text-white/80" : "text-burgundy/50 italic"}`}>{row.en || "—"}</td>
                      <td className={`px-4 py-2.5 text-xs ${row.ar ? "text-white/80" : "text-burgundy/50 italic"}`} dir="rtl">{row.ar || "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(row.id);
                              setEditValues({ fr: row.fr, en: row.en, ar: row.ar });
                            }}
                            className="text-xs font-semibold text-gold hover:text-gold/80"
                          >
                            {t("edit")}
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="text-xs font-semibold text-burgundy hover:text-burgundy/80">{t("delete")}</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {translations.length === 0 && (
            <div className="p-8 text-center text-sm text-muted">{t("no_translations")}</div>
          )}
        </div>
      )}
    </div>
  );
}
