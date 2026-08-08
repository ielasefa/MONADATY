"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChangePasswordPage() {
  const { t } = useTranslation("auth");
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (newPassword.length < 8) {
      toast.error(t("password_too_short"));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t("password_mismatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

       if (res.ok) {
         toast.success(t("password_changed_success", "Password changed successfully"));
         router.push("/admin/dashboard");
         router.refresh();
       } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t("change_password_failed"));
        setLoading(false);
      }
    } catch {
      toast.error(t("network_error"));
      setLoading(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 disabled:opacity-50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md rounded-card border border-white/[0.06] bg-card p-8 shadow-dark sm:p-10"
      >
        <div className="mb-8 text-center">
          <AdminLogo />
          <h1 className="mt-6 font-display text-2xl tracking-wide text-white">{t("change_password")}</h1>
          <p className="mt-2 text-sm text-muted">
            {t("change_password_desc")}
          </p>
        </div>

        <div className="divider-gold mb-6" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="luxury-label mb-1.5 block text-xs text-muted">{t("current_password")}</label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
              <ToggleButton on={showCurrent} onClick={() => setShowCurrent((s) => !s)} label={t("current_password_label", "current password")} />
            </div>
          </div>

          <div>
            <label className="luxury-label mb-1.5 block text-xs text-muted">{t("new_password")}</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className={inputClass}
              />
              <ToggleButton on={showNew} onClick={() => setShowNew((s) => !s)} label={t("new_password_label", "new password")} />
            </div>
            <p className="mt-1 text-xs text-muted">{t("min_chars")}</p>
          </div>

          <div>
            <label className="luxury-label mb-1.5 block text-xs text-muted">{t("confirm_password")}</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className={inputClass}
              />
              <ToggleButton on={showConfirm} onClick={() => setShowConfirm((s) => !s)} label={t("confirm_password_label", "confirm password")} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary h-12 w-full rounded-button text-sm font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t("changing")}
              </span>
            ) : (
              t("change_password")
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ToggleButton({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={on ? `Hide ${label}` : `Show ${label}`}
      aria-pressed={on}
      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-burgundy/30"
    >
      {on ? (
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 4.7A9.5 9.5 0 0121 12a9.6 9.6 0 01-2.3 6.2M6.1 6.1A9.6 9.6 0 003 12a9.5 9.5 0 007 9.2" strokeLinecap="round" strokeLinejoin="round" />
       </svg>
      ) : (
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
       </svg>
      )}
    </button>
  );
}
