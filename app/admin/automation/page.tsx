"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Job = {
  id: string;
  name: string;
  description: string;
  type: string;
  cronExpression: string;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastStatus: string;
  lastDuration: number;
  failureCount: number;
  totalRuns: number;
};

export default function AutomationPage() {
  const { t } = useTranslation("admin");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/automation/jobs");
    if (res.ok) {
      const json = await res.json();
      setJobs(json.jobs || []);
    }
    setLoading(false);
  }, []);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/admin/automation/logs");
    if (res.ok) {
      const json = await res.json();
      setLogs(json.logs || []);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleInit = async () => {
    await fetch("/api/admin/automation/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "initialize" }),
    });
    fetchJobs();
  };

  const handleRun = async (jobId: string) => {
    setRunning(jobId);
    setResult(null);
    const res = await fetch("/api/admin/automation/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", jobId }),
    });
    if (res.ok) {
      const r = await res.json();
      setResult(`${r.status}${t("duration_label")}${r.duration}s`);
    }
    setRunning(null);
    fetchJobs();
    fetchLogs();
  };

  const handleToggle = async (jobId: string, enabled: boolean) => {
    await fetch("/api/admin/automation/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", jobId, data: { enabled } }),
    });
    fetchJobs();
  };

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="luxury-label mb-2">{t("system_label")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("automation_center")}</h1>
          <p className="mt-1 text-sm text-muted">{t("automation_desc")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setShowLogs(!showLogs); if (!showLogs) fetchLogs(); }} className="btn-secondary text-xs">
            {showLogs ? t("hide_logs") : `${t("job_logs", "Job Logs")}`}
          </button>
          <button onClick={handleInit} className="btn-primary text-xs">{t("initialize_default_jobs")}</button>
        </div>
      </div>

      {result && (
        <div className="mb-4 rounded-card border border-emerald/20 bg-emerald/5 p-4 text-sm text-accent">{result}</div>
      )}

      {showLogs && (
        <div className="mb-6 rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("recent_job_logs")}</h3>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {logs.map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded border border-line px-3 py-2 text-xs">
                <span className="text-secondary">{log.job?.name || "Unknown"} — {log.status}</span>
                <span className="text-muted">{new Date(log.createdAt).toLocaleString()} — {log.duration}s</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-xs text-muted">{t("no_logs")}</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="luxury-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 break-words">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{job.name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  job.lastStatus === "success" ? "bg-gold/10 text-accent" :
                  job.lastStatus === "failed" ? "bg-burgundy/10 text-burgundy" :
                  "bg-surface text-muted"
                }`}>{job.lastStatus}</span>
              </div>
              <p className="text-xs text-muted">{job.description} — {job.type} — {job.cronExpression}</p>
              {job.lastRunAt && <p className="text-xs text-muted mt-0.5">Last: {new Date(job.lastRunAt).toLocaleString()} | Duration: {job.lastDuration}s | Runs: {job.totalRuns} | Failures: {job.failureCount}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRun(job.id)}
                disabled={running === job.id}
                className="inline-flex h-8 items-center rounded-button bg-gold/20 px-3 text-xs font-semibold text-accent transition hover:bg-gold/30 disabled:opacity-50"
              >
                {running === job.id ? "..." : t("run")}
              </button>
              <button
                onClick={() => handleToggle(job.id, !job.enabled)}
                className={`inline-flex h-8 items-center rounded-button px-3 text-xs font-semibold transition ${
                  job.enabled ? "bg-gold/10 text-accent hover:bg-emerald/20" : "bg-surface text-muted hover:bg-surface"
                }`}
              >
                {job.enabled ? t("enabled") : t("disabled")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
