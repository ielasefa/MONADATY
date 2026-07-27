"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

type Section = "overview" | "2fa" | "api-keys" | "sessions" | "login-history" | "audit-logs" | "rate-limits";

type AuditLog = { adminName: string; action: string; entity: string; entityId?: string; createdAt: string; ip?: string };
type LoginRecord = { ip: string; browser: string; os: string; device: string; loginAt: string; success: boolean; suspicious?: boolean; duration: number };
type DeviceSession = { id: string; browser: string; os: string; ip: string; lastActiveAt: string };
type ApiKey = { id: string; name: string; key: string; usageCount: number; isActive: boolean; createdAt: string };
type RateLimitData = { totalRequests: number; blockedCount: number; slowCount: number; topAttackers: { ip: string; count: number }[] };

export default function SecurityPage() {
  const { t } = useTranslation("admin");
  const [section, setSection] = useState<Section>("overview");
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSection = useCallback(async (s: Section) => {
    setLoading(true);
    try {
      if (s === "audit-logs") {
        const res = await fetch("/api/admin/audit-logs?limit=50");
        if (res.ok) setAuditLogs((await res.json()).logs);
      }
      if (s === "login-history") {
        const res = await fetch("/api/admin/login-history?limit=50");
        if (res.ok) setLoginHistory((await res.json()).history);
      }
      if (s === "sessions") {
        const res = await fetch("/api/admin/device-sessions");
        if (res.ok) setSessions((await res.json()).sessions);
      }
      if (s === "api-keys") {
        const res = await fetch("/api/admin/api-keys");
        if (res.ok) setApiKeys((await res.json()).keys);
      }
      if (s === "rate-limits") {
        const res = await fetch("/api/admin/rate-limits");
        if (res.ok) setRateLimitData(await res.json());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchSection(section); }, [section, fetchSection]);

  const navItems: { id: Section; label: string }[] = [
    { id: "overview", label: t("overview") },
    { id: "2fa", label: t("two_factor") },
    { id: "api-keys", label: t("api_keys") },
    { id: "sessions", label: t("sessions") },
    { id: "login-history", label: t("login_history") },
    { id: "audit-logs", label: t("audit_logs") },
    { id: "rate-limits", label: t("rate_limits") },
  ];

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("system_label")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("security_center")}</h1>
        <p className="mt-1 text-sm text-muted">{t("security_desc")}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`inline-flex h-9 items-center rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em] transition ${
              section === item.id ? "bg-red text-white" : "border border-white/[0.12] bg-white/5 text-muted hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <div className="h-32 animate-pulse rounded-card bg-white/[0.04]" />}

      {!loading && section === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => setSection("audit-logs")} className="luxury-card group block w-full text-left p-6">
            <h3 className="font-semibold text-white group-hover:text-gold">{t("audit_logs")}</h3>
            <p className="mt-1 text-sm text-muted">{auditLogs.length > 0 ? t("recent_entries").replace("{count}", String(auditLogs.length)) : t("view_all_admin_actions")}</p>
          </button>
          <button onClick={() => setSection("login-history")} className="luxury-card group block w-full text-left p-6">
            <h3 className="font-semibold text-white group-hover:text-gold">{t("login_history")}</h3>
            <p className="mt-1 text-sm text-muted">{loginHistory.length > 0 ? t("recent_logins").replace("{count}", String(loginHistory.length)) : t("monitor_login_attempts")}</p>
          </button>
          <button onClick={() => setSection("sessions")} className="luxury-card group block w-full text-left p-6">
            <h3 className="font-semibold text-white group-hover:text-gold">{t("device_sessions")}</h3>
            <p className="mt-1 text-sm text-muted">{sessions.length > 0 ? t("active_sessions_count").replace("{count}", String(sessions.length)) : t("manage_active_sessions")}</p>
          </button>
          <button onClick={() => setSection("api-keys")} className="luxury-card group block w-full text-left p-6">
            <h3 className="font-semibold text-white group-hover:text-gold">{t("api_keys")}</h3>
            <p className="mt-1 text-sm text-muted">{apiKeys.length > 0 ? t("keys_configured").replace("{count}", String(apiKeys.length)) : t("manage_api_access_keys")}</p>
          </button>
          <button onClick={() => setSection("rate-limits")} className="luxury-card group block w-full text-left p-6">
            <h3 className="font-semibold text-white group-hover:text-gold">{t("rate_limits")}</h3>
            <p className="mt-1 text-sm text-muted">{rateLimitData ? t("blocked_requests_count").replace("{count}", String(rateLimitData.blockedCount)) : t("monitor_rate_limits")}</p>
          </button>
          <div className="luxury-card p-6">
            <h3 className="font-semibold text-white">{t("two_factor_auth")}</h3>
            <p className="mt-1 text-sm text-muted">{t("two_factor_desc")}</p>
            <button className="mt-3 btn-primary text-xs">{t("enable_2fa")}</button>
          </div>
        </div>
      )}

      {!loading && section === "audit-logs" && (
        <div className="rounded-card border border-white/[0.06] bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">{t("audit_logs")}</h3>
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {auditLogs.map((log, i) => (
              <div key={i} className="flex items-start justify-between rounded border border-white/[0.04] px-3 py-2">
                <div>
                  <p className="text-xs text-white/80"><span className="font-medium text-gold">{log.adminName}</span> {log.action} {log.entity}</p>
                  {log.entityId && <p className="text-[10px] text-muted">{t("id_label")}: {log.entityId}</p>}
                </div>
                <div className="text-right text-[10px] text-muted">
                  <p>{new Date(log.createdAt).toLocaleString()}</p>
                  {log.ip && <p>{log.ip}</p>}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && <p className="text-xs text-muted">{t("no_audit_logs")}</p>}
          </div>
        </div>
      )}

      {!loading && section === "login-history" && (
        <div className="rounded-card border border-white/[0.06] bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">{t("login_history")}</h3>
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {loginHistory.map((h, i) => (
              <div key={i} className={`flex items-start justify-between rounded border px-3 py-2 ${
                h.success ? "border-white/[0.04]" : "border-red/20 bg-red/[0.03]"
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${h.success ? "bg-emerald" : "bg-red"}`} />
                    <span className="text-xs text-white/80">{h.browser} / {h.os}</span>
                    {h.suspicious && <span className="badge-red text-[9px]">{t("suspicious")}</span>}
                  </div>
                  <p className="text-[10px] text-muted">{h.ip} — {h.device}</p>
                </div>
                <div className="text-right text-[10px] text-muted">
                  <p>{new Date(h.loginAt).toLocaleString()}</p>
                  {h.duration > 0 && <p>{t("duration_label")}{h.duration}s</p>}
                </div>
              </div>
            ))}
            {loginHistory.length === 0 && <p className="text-xs text-muted">{t("no_login_history")}</p>}
          </div>
        </div>
      )}

      {!loading && section === "sessions" && (
        <div className="rounded-card border border-white/[0.06] bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{t("device_sessions")}</h3>
            <button
              onClick={async () => {
                await fetch("/api/admin/device-sessions?allExceptCurrent=true", { method: "DELETE" });
                fetchSection("sessions");
              }}
              className="text-xs font-semibold text-red hover:text-red/80"
            >
              {t("terminate_all_other")}
            </button>
          </div>
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2">
                <div>
                  <p className="text-xs text-white/80">{s.browser} on {s.os}</p>
                  <p className="text-[10px] text-muted">{s.ip} — {t("last_active")}: {new Date(s.lastActiveAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={async () => {
                    await fetch(`/api/admin/device-sessions?id=${s.id}`, { method: "DELETE" });
                    fetchSection("sessions");
                  }}
                  className="text-xs font-semibold text-red hover:text-red/80"
                >
                  {t("terminate")}
                </button>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-xs text-muted">{t("no_active_sessions")}</p>}
          </div>
        </div>
      )}

      {!loading && section === "api-keys" && (
        <div className="space-y-6">
          <div className="rounded-card border border-white/[0.06] bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">{t("create_api_key")}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              const res = await fetch("/api/admin/api-keys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: data.get("name"),
                  permissions: ["read", "write"],
                }),
              });
              if (res.ok) {
                const json = await res.json();
                toast.success(t("key_created_alert").replace("{key}", json.key));
                form.reset();
                fetchSection("api-keys");
              } else {
                const json = await res.json();
                toast.error(json.error || t("key_create_failed"));
              }
            }} className="flex gap-3">
              <input name="name" placeholder={t("key_name_placeholder")} required className="input-premium flex-1 px-3 py-2 text-sm" />
              <button type="submit" className="btn-primary text-xs">{t("generate_key")}</button>
            </form>
          </div>

          <div className="rounded-card border border-white/[0.06] bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">{t("api_keys")}</h3>
            <div className="space-y-2">
              {apiKeys.map((key, i) => (
                <div key={i} className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2">
                  <div>
                    <p className="text-xs text-white/80">{key.name} — {key.key?.slice(0, 20)}...</p>
                    <p className="text-[10px] text-muted">{t("uses_label")}: {key.usageCount} | {t("active_label")}: {key.isActive ? t("yes") : t("no")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-gold hover:text-gold/80">{t("regenerate")}</button>
                    <button className="text-xs text-red hover:text-red/80">{t("delete")}</button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && <p className="text-xs text-muted">{t("no_api_keys")}</p>}
            </div>
          </div>
        </div>
      )}

      {!loading && section === "rate-limits" && rateLimitData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-card border border-white/[0.06] bg-card p-4">
                <p className="text-[10px] text-muted">{t("total_requests")}</p>
              <p className="mt-1 text-xl font-semibold text-white">{rateLimitData.totalRequests}</p>
            </div>
            <div className="rounded-card border border-white/[0.06] bg-card p-4">
              <p className="text-[10px] text-muted">{t("blocked")}</p>
              <p className="mt-1 text-xl font-semibold text-red">{rateLimitData.blockedCount}</p>
            </div>
            <div className="rounded-card border border-white/[0.06] bg-card p-4">
              <p className="text-[10px] text-muted">{t("slow_requests")}</p>
              <p className="mt-1 text-xl font-semibold text-gold">{rateLimitData.slowCount}</p>
            </div>
            <div className="rounded-card border border-white/[0.06] bg-card p-4">
              <p className="text-[10px] text-muted">{t("top_attackers")}</p>
              <p className="mt-1 text-xl font-semibold text-white">{rateLimitData.topAttackers?.length || 0}</p>
            </div>
          </div>

          <div className="rounded-card border border-white/[0.06] bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-white">{t("top_attackers")}</h3>
            <div className="space-y-2">
              {(rateLimitData.topAttackers || []).map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2 text-xs">
                  <span className="text-white/80">{a.ip}</span>
                  <span className="text-muted">{t("blocked_requests_count").replace("{count}", String(a.count))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
