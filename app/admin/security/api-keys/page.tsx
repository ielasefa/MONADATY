"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  permissions?: string;
};

export default function ApiKeysPage() {
  const { t } = useTranslation("admin");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/api-keys");
    if (res.ok) setKeys((await res.json()).keys);
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.get("name"), permissions: ["read", "write"] }),
    });
    if (res.ok) {
      const json = await res.json();
      setNewKey(json.key);
      form.reset();
      fetchKeys();
    }
  };

  const handleRegenerate = async (id: string) => {
    const res = await fetch("/api/admin/api-keys", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "regenerate" }),
    });
    if (res.ok) {
      const json = await res.json();
      setNewKey(json.key);
      fetchKeys();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("delete_key_confirm"))) return;
    await fetch(`/api/admin/api-keys?id=${id}`, { method: "DELETE" });
    fetchKeys();
  };

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("security", "Security")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("api_keys", "API Keys")}</h1>
        <p className="mt-1 text-sm text-muted">{t("api_keys_desc")}</p>
      </div>

      {newKey && (
        <div className="mb-6 rounded-card border border-gold/20 bg-gold/5 p-4">
          <p className="text-sm font-semibold text-gold">{t("new_api_key_generated")}</p>
          <p className="mt-1 text-xs text-white/80 break-all font-mono">{newKey}</p>
          <p className="mt-1 text-xs text-burgundy">{t("save_key_warning")}</p>
          <button onClick={() => setNewKey(null)} className="mt-2 text-xs text-muted hover:text-white">{t("dismiss")}</button>
        </div>
      )}

      <div className="mb-6 rounded-card border border-white/[0.06] bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">{t("create_new_key")}</h3>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input name="name" placeholder={t("key_name_placeholder")} required className="input-premium flex-1 px-3 py-2 text-sm" />
          <button type="submit" className="btn-primary text-xs">{t("generate")}</button>
        </form>
      </div>

      <div className="rounded-card border border-white/[0.06] bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">{t("existing_keys")}</h3>
        {loading ? <div className="h-24 animate-pulse rounded bg-white/[0.04]" /> : (
          <div className="space-y-3">
            {keys.map((key, i) => (
              <div key={i} className="flex items-center justify-between rounded border border-white/[0.04] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{key.name}</p>
                  <p className="text-xs text-muted">Key: {key.key?.slice(0, 12)}... | Used: {key.usageCount} times | Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted">Permissions: {(JSON.parse(key.permissions || "[]") as string[]).join(", ") || "None"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRegenerate(key.id)} className="text-xs font-semibold text-gold hover:text-gold/80">{t("regenerate")}</button>
                  <button onClick={() => handleDelete(key.id)} className="text-xs font-semibold text-burgundy hover:text-burgundy/80">{t("delete")}</button>
                </div>
              </div>
            ))}
            {keys.length === 0 && <p className="text-sm text-muted">{t("no_api_keys")}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
