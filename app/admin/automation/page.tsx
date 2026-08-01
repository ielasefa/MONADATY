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

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="luxury-label mb-2">System</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Automation Center</h1>
          <p className="mt-1 text-sm text-muted">Scheduled jobs and task automation</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowLogs(!showLogs); if (!showLogs) fetchLogs(); }} className="btn-secondary text-xs">
            {showLogs ? t("hide_logs") : `${t("job_logs", "Job Logs")}`}
          </button>
          <button onClick={handleInit} className="btn-primary text-xs">Initialize Default Jobs</button>
        </div>
      </div>

      {result && (
        <div className="mb-4 rounded-card border border-emerald/20 bg-emerald/5 p-4 text-sm text-gold">{result}</div>
      )}

      {showLogs && (
        <div className="mb-6 rounded-card border border-white/[0.06] bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">Recent Job Logs</h3>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {logs.map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2 text-xs">
                <span className="text-white/80">{log.job?.name || "Unknown"} — {log.status}</span>
                <span className="text-muted">{new Date(log.createdAt).toLocaleString()} — {log.duration}s</span>
              </div>
            ))}
            {logs.length === 0 && <p className="text-xs text-muted">{t("no_logs")}</p>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="luxury-card flex items-center gap-4 p-5">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{job.name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  job.lastStatus === "success" ? "bg-gold/10 text-gold" :
                  job.lastStatus === "failed" ? "bg-burgundy/10 text-burgundy" :
                  "bg-white/5 text-muted"
                }`}>{job.lastStatus}</span>
              </div>
              <p className="text-xs text-muted">{job.description} — {job.type} — {job.cronExpression}</p>
              {job.lastRunAt && <p className="text-[10px] text-muted mt-0.5">Last: {new Date(job.lastRunAt).toLocaleString()} | Duration: {job.lastDuration}s | Runs: {job.totalRuns} | Failures: {job.failureCount}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRun(job.id)}
                disabled={running === job.id}
                className="inline-flex h-8 items-center rounded-button bg-gold/20 px-3 text-[11px] font-semibold text-gold transition hover:bg-gold/30 disabled:opacity-50"
              >
                {running === job.id ? "..." : "Run"}
              </button>
              <button
                onClick={() => handleToggle(job.id, !job.enabled)}
                className={`inline-flex h-8 items-center rounded-button px-3 text-[11px] font-semibold transition ${
                  job.enabled ? "bg-gold/10 text-gold hover:bg-emerald/20" : "bg-white/5 text-muted hover:bg-white/10"
                }`}
              >
                {job.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
