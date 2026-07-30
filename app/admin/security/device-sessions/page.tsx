"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type DeviceSession = {
  id: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  isCurrent?: boolean;
  createdAt: string;
  lastActiveAt: string;
  country?: string;
};

export default function DeviceSessionsPage() {
  const { t } = useTranslation("admin");
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/device-sessions");
    if (res.ok) setSessions((await res.json()).sessions);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleTerminate = async (id: string) => {
    await fetch(`/api/admin/device-sessions?id=${id}`, { method: "DELETE" });
    fetchSessions();
  };

  const handleTerminateAll = async () => {
    if (!confirm(t("terminate_all_confirm"))) return;
    await fetch("/api/admin/device-sessions?allExceptCurrent=true", { method: "DELETE" });
    fetchSessions();
  };

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">Security</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Device Sessions</h1>
          <p className="mt-1 text-sm text-muted">{t("manage_sessions")}</p>
        </div>
          <button onClick={handleTerminateAll} className="btn-secondary text-xs">{t("terminate_all")}</button>
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /> : (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className={`luxury-card flex items-center justify-between p-5 ${s.isCurrent ? "border-gold/30" : ""}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.isCurrent ? "bg-emerald" : "bg-white/20"}`} />
                  <p className="font-medium text-white">{s.browser} on {s.os}</p>
                  {s.isCurrent && <span className="rounded bg-emerald/10 px-2 py-0.5 text-[10px] font-medium text-gold">{t("current")}</span>}
                </div>
                <p className="mt-1 text-xs text-muted">IP: {s.ip} | Device: {s.device} | Country: {s.country || "N/A"}</p>
                <p className="text-[10px] text-muted">Created: {new Date(s.createdAt).toLocaleString()} | Last Active: {new Date(s.lastActiveAt).toLocaleString()}</p>
              </div>
              {!s.isCurrent && (
                <button onClick={() => handleTerminate(s.id)} className="text-xs font-semibold text-burgundy hover:text-burgundy/80">{t("terminate")}</button>
              )}
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-muted">{t("no_active_sessions")}</p>}
        </div>
      )}
    </div>
  );
}
