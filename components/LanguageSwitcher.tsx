"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-ivory/[0.06] bg-ivory/[0.02] px-3 py-1.5 text-[0.65rem] font-medium text-ivory/60 transition-all duration-200 hover:border-ivory/[0.12] hover:text-ivory"
        aria-label={t("select_language")}
        aria-expanded={open}
      >
        <span className="text-sm">{current.flag}</span>
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
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-md border border-ivory/[0.06] bg-black-surface shadow-premium-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors duration-150 ${
                lang === l.code
                  ? "bg-ivory/[0.04] text-ivory"
                  : "text-ivory/50 hover:bg-ivory/[0.03] hover:text-ivory"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1">{l.label}</span>
              {lang === l.code && (
                <svg
                  width={24}
                  height={24}
                  className="h-3.5 w-3.5 shrink-0 text-gold"
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
