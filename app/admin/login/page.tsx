"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { useTranslation } from "@/hooks/useTranslation";

function AdminLoginForm() {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const redirect = searchParams?.get("redirect");
        await new Promise((r) => setTimeout(r, 50));
        if (data.mustChangePassword) {
          window.location.href = "/admin/change-password";
        } else if (redirect && redirect.startsWith("/admin/")) {
          window.location.href = redirect;
        } else {
          window.location.href = "/admin/dashboard";
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || t("login_failed"));
        setLoading(false);
      }
    } catch {
      setError(t("network_error"));
      setLoading(false);
    }
  }

const inputClass = 
"h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 text-sm text-white outline-none transition placeholder:text-muted/50 focus:border-burgundy focus:ring-1 focus:ring-burgundy/30 disabled:opacity-50";
const inputPasswordClass = 
"h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 pr-12 text-sm text-white outline-none transition placeholder:text-muted/50 focus:border-burgundy focus:ring-1 focus:ring-burgundy/30 disabled:opacity-50";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass w-full max-w-md rounded-card border border-white/[0.06] bg-card p-8 shadow-dark sm:p-10"
      >
        <div className="mb-8 text-center">
          <AdminLogo size="lg" />
          <h1 className="mt-6 font-display text-2xl tracking-wide text-white">{t("admin_login")}</h1>
          <p className="mt-2 text-sm text-muted">{t("sign_in_dashboard")}</p>
        </div>

        <div className="divider-gold mb-6" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="luxury-label mb-1.5 block text-xs text-muted" htmlFor="login-email">{t("email_label")}</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder={t("email_placeholder_admin")}
              className={inputClass}
            />
          </div>

          <div>
            <label className="luxury-label mb-1.5 block text-xs text-muted" htmlFor="login-password">{t("password_label")}</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder={t("password_placeholder")}
                className={inputPasswordClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t("hide_password") : t("show_password")}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-burgundy/30"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 4.7A9.5 9.5 0 0121 12a9.6 9.6 0 01-2.3 6.2M6.1 6.1A9.6 9.6 0 003 12a9.5 9.5 0 007 9.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-burgundy/20 bg-burgundy/10 px-4 py-3 text-sm text-burgundy" role="alert"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={loading ? undefined : { scale: 1.02 }}
            whileTap={loading ? undefined : { scale: 0.98 }}
            className="btn-primary h-12 w-full rounded-button text-sm font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                {t("signing_in")}
              </span>
            ) : (
              t("sign_in")
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
