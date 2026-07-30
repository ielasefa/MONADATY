"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type AuditLog = {
  adminName: string;
  action: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  ip?: string;
  oldValue?: string;
  newValue?: string;
  browser?: string;
  duration?: number;
};

export default function AuditLogsPage() {
  const { t } = useTranslation("admin");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = filter ? `?action=${filter}` : "";
    const res = await fetch(`/api/admin/audit-logs${params}`);
    if (res.ok) setLogs((await res.json()).logs);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const actions = ["", "create", "update", "delete", "login", "logout", "order_update", "settings_update", "security_change"];

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">Security</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Audit Logs</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map(a => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`inline-flex h-8 items-center rounded-button px-3 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                filter === a ? "bg-burgundy text-white" : "border border-white/[0.12] bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              {a || t("all")}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /> : (
        <div className="rounded-card border border-white/[0.06] bg-card p-6">
          <div className="max-h-[700px] space-y-2 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start justify-between rounded border border-white/[0.04] px-3 py-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gold">{log.adminName}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">{log.action}</span>
                    <span className="text-xs text-white/60">{log.entity}</span>
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-1 text-[10px] text-muted">
                      {log.oldValue && <span className="text-burgundy">Old: {log.oldValue}</span>}
                      {log.oldValue && log.newValue && <span className="mx-1">→</span>}
                      {log.newValue && <span className="text-gold">New: {log.newValue}</span>}
                    </div>
                  )}
                  {log.browser && <p className="text-[10px] text-muted mt-0.5">{log.browser} | IP: {log.ip} | Duration: {log.duration}ms</p>}
                </div>
                <div className="shrink-0 text-right text-[10px] text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-xs text-muted">{t("no_audit_logs")}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
