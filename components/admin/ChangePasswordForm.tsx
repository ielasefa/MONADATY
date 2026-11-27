"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AdminLogo } from "@/components/admin/AdminLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketIcon } from "@/components/MarketIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { changePasswordCopy } from "@/lib/change-password-copy";

type Field = "currentPassword" | "newPassword" | "confirmPassword";

export default function ChangePasswordForm({ logoUrl }: { logoUrl?: string }) {
  const { lang } = useTranslation("auth");
  const labels = changePasswordCopy[lang];
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visible, setVisible] = useState<Record<Field, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const fields = [
    { key: "currentPassword" as const, label: labels.current, placeholder: labels.currentPlaceholder, autoComplete: "current-password" },
    { key: "newPassword" as const, label: labels.next, placeholder: labels.nextPlaceholder, autoComplete: "new-password" },
    { key: "confirmPassword" as const, label: labels.confirm, placeholder: labels.confirmPlaceholder, autoComplete: "new-password" },
  ];
  const longEnough = values.newPassword.length >= 12;
  const matches = longEnough && values.confirmPassword === values.newPassword;

  function change(field: Field, value: string) {
    setValues(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined, ...(field === "newPassword" ? { confirmPassword: undefined } : {}) }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    const nextErrors: Partial<Record<Field, string>> = {};
    if (!values.currentPassword) nextErrors.currentPassword = labels.required;
    if (!longEnough) nextErrors.newPassword = labels.tooShort;
    if (!values.confirmPassword || values.confirmPassword !== values.newPassword) nextErrors.confirmPassword = labels.mismatch;
    setErrors(nextErrors);
    const firstInvalid = fields.find(field => nextErrors[field.key]);
    if (firstInvalid) {
      requestAnimationFrame(() => inputs.current[firstInvalid.key]?.focus());
      return;
    }
    setError("");
    setSessionExpired(false);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
      });
      if (response.ok) {
        toast.success(labels.success);
        router.push("/admin/dashboard");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { setSessionExpired(true); setError(labels.session); }
      else if (response.status === 429) setError(labels.rate);
      else if (data.error === "Current password is incorrect") {
        setErrors({ currentPassword: labels.wrongCurrent });
        inputs.current.currentPassword?.focus();
      } else if (data.error === "Passwords do not match") setErrors({ confirmPassword: labels.mismatch });
      else if (data.error === "New password must be at least 12 characters") setErrors({ newPassword: labels.tooShort });
      else setError(labels.server);
    } catch {
      setError(labels.network);
    }
    setLoading(false);
  }

  return (
    <div className="market-auth market-password">
      <header className="password-topbar">
        <AdminLogo size="md" logoUrl={logoUrl} />
        <LanguageSwitcher />
      </header>
      <section className="password-layout" aria-labelledby="password-title">
        <div className="password-intro">
          <span className="password-security-icon" aria-hidden="true"><MarketIcon name="shield" /></span>
          <p className="password-eyebrow">{labels.eyebrow}</p>
          <h1 id="password-title">{labels.title}</h1>
          <p className="password-description">{labels.intro}</p>
          <div className="password-note"><h2>{labels.noteTitle}</h2><p>{labels.note}</p></div>
          <Link href="/" className="password-back"><MarketIcon name="shop" />{labels.back}</Link>
        </div>
        <section className="market-auth-card password-card" aria-labelledby="password-form-title">
          <div className="password-card-heading"><h2 id="password-form-title">{labels.formTitle}</h2><p>{labels.formIntro}</p></div>
          <form onSubmit={handleSubmit} noValidate aria-busy={loading}>
            <div className="password-fields">
              {fields.map(field => {
                const id = `change-${field.key}`;
                const hint = field.key === "newPassword" ? `${id}-hint` : undefined;
                return (
                  <div key={field.key} className="password-field">
                    <label htmlFor={id}>{field.label}</label>
                    <div className="password-input-wrap">
                      <input id={id} name={field.key} ref={element => { inputs.current[field.key] = element; }}
                        type={visible[field.key] ? "text" : "password"} dir="ltr" autoComplete={field.autoComplete}
                        value={values[field.key]} onChange={event => change(field.key, event.target.value)}
                        required minLength={field.key === "currentPassword" ? undefined : 12} disabled={loading}
                        placeholder={field.placeholder} aria-invalid={Boolean(errors[field.key])}
                        aria-describedby={[hint, errors[field.key] ? `${id}-error` : undefined].filter(Boolean).join(" ") || undefined}
                        className="market-login-input" />
                      <button type="button" className="password-toggle" disabled={loading}
                        onClick={() => setVisible(previous => ({ ...previous, [field.key]: !previous[field.key] }))}
                        aria-label={`${visible[field.key] ? labels.hide : labels.show} ${field.label}`} aria-pressed={visible[field.key]}>
                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C5 3 19 3 22 12C19 21 5 21 2 12Z" /><circle cx="12" cy="12" r="3" />{visible[field.key] && <path d="m3 3 18 18" />}</svg>
                      </button>
                    </div>
                    {hint && <p id={hint} className="password-hint" data-met={longEnough}><RequirementMark met={longEnough} />{labels.minimum}</p>}
                    {field.key === "confirmPassword" && matches && <p className="password-hint" data-met="true" role="status"><RequirementMark met />{labels.matching}</p>}
                    {errors[field.key] && <p id={`${id}-error`} className="password-field-error" role="alert">{errors[field.key]}</p>}
                  </div>
                );
              })}
            </div>
            {error && <div className="password-error" role="alert"><p>{error}</p>{sessionExpired && <Link href="/admin/login">{labels.signIn}</Link>}</div>}
            <button type="submit" disabled={loading} className="btn-primary password-submit">
              {loading ? <span className="password-spinner" aria-hidden="true" /> : <LockIcon />}
              {loading ? labels.saving : labels.save}
            </button>
          </form>
          <p className="password-account"><LockIcon />{labels.account}</p>
        </section>
      </section>
    </div>
  );
}

function RequirementMark({ met }: { met: boolean }) {
  return <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="10" cy="10" r="7.5" />{met && <path d="m6.5 10 2.3 2.3 4.7-4.7" strokeLinecap="round" strokeLinejoin="round" />}</svg>;
}

function LockIcon() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
}
