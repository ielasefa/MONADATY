"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

export function LanguageSwitcher({ className = "", dropUp = false }: { className?: string; dropUp?: boolean }) {
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation("system");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setOpen(false);
    router.refresh();
  };

  return (
    <div ref={ref} className={`language-switcher relative ${className}`}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 items-center gap-2 rounded-md border border-line bg-ivory/[0.02] px-3 py-1.5 text-sm font-medium text-secondary transition-all duration-200 hover:border-line hover:text-foreground"
        aria-label={t("select_language", { fr: "Choisir la langue", en: "Choose language", ar: "اختر اللغة" }[lang])}
        aria-expanded={open}
      >
        <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z" /></svg>
        <span>{current.code.toUpperCase()}</span>
        <svg
          width={24}
          height={24}
          className={`h-3 w-3 shrink-0 opacity-40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points={dropUp ? "6 15 12 9 18 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>

      {open && (
        <div className={`language-menu absolute end-0 z-50 w-44 overflow-hidden rounded-md border border-line bg-card shadow-premium-lg ${dropUp ? "bottom-full mb-1.5" : "top-full mt-1.5"}`}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              aria-pressed={lang === l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-start text-sm transition-colors duration-150 ${
                lang === l.code
                  ? "bg-ivory/[0.04] text-foreground"
                  : "text-secondary hover:bg-ivory/[0.03] hover:text-foreground"
              }`}
            >
              <span className="w-6 text-xs font-medium" aria-hidden="true">{l.code.toUpperCase()}</span>
              <span className="flex-1">{l.label}</span>
              {lang === l.code && (
                <svg
                  width={24}
                  height={24}
                  className="h-3.5 w-3.5 shrink-0 text-accent"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
