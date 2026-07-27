"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type LoginRecord = {
  ip: string;
  browser: string;
  os: string;
  device: string;
  loginAt: string;
  logoutAt?: string;
  success: boolean;
  suspicious?: boolean;
  duration: number;
  country?: string;
  city?: string;
};

export default function LoginHistoryPage() {
  const { t } = useTranslation("admin");
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/login-history?limit=200");
    if (res.ok) setHistory((await res.json()).history);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search ? history.filter(h => h.ip?.includes(search) || h.browser?.toLowerCase().includes(search.toLowerCase()) || h.os?.toLowerCase().includes(search.toLowerCase())) : history;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">Security</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Login History</h1>
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-premium mt-4 w-full max-w-md px-3 py-2 text-sm"
        />
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /> : (
        <div className="space-y-2">
          {filtered.map((h, i) => (
            <div key={i} className={`luxury-card flex items-start justify-between p-4 ${h.suspicious ? "border-red/20" : ""}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${h.success ? "bg-emerald" : "bg-red"}`} />
                  <span className="font-medium text-white">{h.browser} on {h.os}</span>
                  {h.suspicious && <span className="badge-red text-[9px]">{t("suspicious")}</span>}
                </div>
                <p className="mt-1 text-xs text-muted">IP: {h.ip} | Device: {h.device} | Country: {h.country || "N/A"} | City: {h.city || "N/A"}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{new Date(h.loginAt).toLocaleString()}</p>
                {h.logoutAt && <p>Logout: {new Date(h.logoutAt).toLocaleString()}</p>}
                {h.duration > 0 && <p>Duration: {Math.floor(h.duration / 60)}m {h.duration % 60}s</p>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted">{t("no_records")}</p>}
        </div>
      )}
    </div>
  );
}
