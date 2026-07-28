"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

export function MobileLanguageSwitcher({ onSelect }: { onSelect?: () => void }) {
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation("system");

  return (
    <div className="space-y-1">
      <p className="px-3 text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-ivory/30">
        {t("language")}
      </p>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => {
            setLang(l.code);
            onSelect?.();
          }}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
            lang === l.code
              ? "bg-ivory/[0.04] text-ivory"
              : "text-ivory/40 hover:bg-ivory/[0.03] hover:text-ivory"
          }`}
        >
          <span className="text-base">{l.flag}</span>
          <span className={`flex-1 ${l.code === "ar" ? "font-arabic" : ""}`}>{l.label}</span>
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
  );
}
