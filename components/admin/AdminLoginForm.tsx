"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketIcon } from "@/components/MarketIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { adminLoginDestination } from "@/lib/admin-login-destination";

const copy = {
  fr: { eyebrow: "Espace professionnel", title: "Accès administrateur", intro: "Connectez-vous pour gérer votre boutique.", email: "Adresse e-mail", emailPlaceholder: "vous@entreprise.ma", password: "Mot de passe", passwordPlaceholder: "Votre mot de passe", show: "Afficher le mot de passe", hide: "Masquer le mot de passe", submit: "Se connecter", loading: "Connexion en cours…", back: "Revenir à la boutique", story: "Votre boutique,\nà portée de main.", description: "Gérez vos produits, vos commandes et votre sélection de boissons depuis un même espace.", private: "Administration MONADATY", invalid: "L’adresse e-mail ou le mot de passe est incorrect.", origin: "Cette adresse n’est pas autorisée pour la connexion. Rouvrez cette page depuis l’adresse de la boutique.", rate: "Trop de tentatives récentes. Patientez un instant avant de réessayer.", server: "La connexion est temporairement indisponible. Réessayez dans un instant.", network: "Impossible de joindre le serveur. Vérifiez votre connexion.", session: "La connexion n’a pas pu être confirmée. Rechargez la page et réessayez." },
  en: { eyebrow: "Business workspace", title: "Admin sign in", intro: "Sign in to manage your store.", email: "Email address", emailPlaceholder: "you@company.com", password: "Password", passwordPlaceholder: "Your password", show: "Show password", hide: "Hide password", submit: "Sign in", loading: "Signing in…", back: "Back to storefront", story: "Your store,\nat your fingertips.", description: "Manage your products, orders and beverage selection in one workspace.", private: "MONADATY administration", invalid: "The email address or password is incorrect.", origin: "This address is not authorized for sign in. Reopen this page from your store’s address.", rate: "Too many recent attempts. Please wait a moment before trying again.", server: "Sign in is temporarily unavailable. Please try again shortly.", network: "The server could not be reached. Check your connection.", session: "Your session could not be confirmed. Reload the page and try again." },
  ar: { eyebrow: "مساحة المهنيين", title: "دخول الإدارة", intro: "سجّل الدخول لإدارة متجرك.", email: "البريد الإلكتروني", emailPlaceholder: "you@company.ma", password: "كلمة المرور", passwordPlaceholder: "كلمة المرور الخاصة بك", show: "إظهار كلمة المرور", hide: "إخفاء كلمة المرور", submit: "تسجيل الدخول", loading: "جارٍ تسجيل الدخول…", back: "العودة إلى المتجر", story: "متجرك،\nبين يديك.", description: "أدر منتجاتك وطلباتك واختيارات المشروبات من مساحة واحدة.", private: "إدارة موناداتي", invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", origin: "عنوان هذه الصفحة غير معتمد للدخول. افتح الصفحة من عنوان متجرك.", rate: "محاولات كثيرة مؤخراً. انتظر قليلاً قبل المحاولة مجدداً.", server: "تسجيل الدخول غير متاح مؤقتاً. حاول مجدداً بعد قليل.", network: "تعذّر الاتصال بالخادم. تحقق من اتصالك.", session: "تعذّر تأكيد تسجيل الدخول. أعد تحميل الصفحة وحاول مجدداً." },
};

export function AdminLoginForm({ requestedDestination }: { requestedDestination?: string }) {
  const { lang } = useTranslation("auth");
  const labels = copy[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const fields = new FormData(event.currentTarget);
    const submittedEmail = String(fields.get("email") || "").trim();
    const submittedPassword = String(fields.get("password") || "");
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submittedEmail, password: submittedPassword }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(response.status === 401 ? labels.invalid : response.status === 403 ? labels.origin : response.status === 429 ? labels.rate : labels.server);
        setLoading(false); return;
      }
      const session = await fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" });
      const state = await session.json().catch(() => null);
      if (!session.ok || !state?.authenticated) {
        setError(labels.session); setLoading(false); return;
      }
      window.location.replace(adminLoginDestination(requestedDestination, state.mustChangePassword));
    } catch { setError(labels.network); setLoading(false); }
  }

  return (
    <div className="market-auth market-login">
      <aside className="market-login-story">
        <AdminLogo size="lg" />
        <div><span className="market-login-rule" aria-hidden="true" /><p className="mb-5 text-sm font-medium">{labels.eyebrow}</p><h2>{labels.story}</h2><p className="mt-6 max-w-sm text-base leading-relaxed">{labels.description}</p></div>
        <p className="text-sm">{labels.private}</p>
      </aside>
      <div className="market-login-content">
        <section className="market-auth-card w-full max-w-md p-6 sm:p-10" aria-labelledby="login-title">
          <div className="mb-8 flex items-start justify-between gap-4"><AdminLogo size="md" /><LanguageSwitcher /></div>
          <h1 id="login-title" className="text-2xl font-semibold text-brand sm:text-3xl">{labels.title}</h1>
          <p className="mt-3 text-base leading-relaxed text-secondary">{labels.intro}</p>
          <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={loading} aria-describedby={error ? "login-error" : undefined}>
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-medium">{labels.email}</label>
              <input id="login-email" name="email" type="email" dir="ltr" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={loading} value={email}
                onChange={event => { setEmail(event.target.value); setError(""); }} placeholder={labels.emailPlaceholder}
                className="market-login-input" aria-invalid={Boolean(error)} />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-medium">{labels.password}</label>
              <div className="relative">
                <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={loading} value={password}
                  onChange={event => { setPassword(event.target.value); setError(""); }} placeholder={labels.passwordPlaceholder}
                  className="market-login-input pe-14" aria-invalid={Boolean(error)} />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? labels.hide : labels.show} aria-pressed={showPassword}
                  className="absolute end-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-secondary hover:bg-canvas hover:text-brand">
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M2 12C5 3 19 3 22 12C19 21 5 21 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m3 3 18 18" />}
                  </svg>
                </button>
              </div>
            </div>
            {error && <p id="login-error" role="alert" className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm leading-relaxed text-brand">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary min-h-12 w-full disabled:cursor-wait disabled:opacity-60">
              {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {loading ? labels.loading : labels.submit}
            </button>
          </form>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-secondary hover:text-brand"><MarketIcon name="shop" />{labels.back}</Link>
        </section>
      </div>
    </div>
  );
}
