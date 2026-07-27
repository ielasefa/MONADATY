"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Language = "fr" | "en" | "ar";

const LANGUAGE_COOKIE = "monadaty_lang";
const DEFAULT_LANG: Language = "fr";

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  isRTL: false,
  dir: "ltr",
});

function getInitialLanguage(): Language {
  if (typeof document === "undefined") return DEFAULT_LANG;
  const htmlLang = document.documentElement.lang;
  if (htmlLang && ["fr", "en", "ar"].includes(htmlLang)) return htmlLang as Language;
  const match = document.cookie.match(new RegExp(`(^| )${LANGUAGE_COOKIE}=([^;]+)`));
  const cookie = match?.[2] as Language | undefined;
  if (cookie && ["fr", "en", "ar"].includes(cookie)) return cookie;
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (["fr", "en", "ar"].includes(browserLang)) return browserLang as Language;
  return DEFAULT_LANG;
}

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang?: Language }) {
  const [lang, setLangState] = useState<Language>(initialLang ?? getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    document.cookie = `${LANGUAGE_COOKIE}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  }, []);

  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, setLang, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
