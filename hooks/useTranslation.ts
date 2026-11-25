"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";
import { useCallback, useRef } from "react";
import { interpolate, resolveTranslation } from "@/lib/translation-utils";
import { useTranslationNamespace } from "@/components/TranslationHydrator";
import { STOREFRONT_UI_COPY } from "@/lib/storefront-ui-copy";
import { ADMIN_UI_COPY } from "@/lib/admin-ui-copy";

export function useTranslation(namespace = "common") {
  const { lang } = useLanguage();
  const { translations, loadNamespace } = useTranslationNamespace(namespace);

  const translationsRef = useRef(translations);
  translationsRef.current = translations;
  const langRef = useRef(lang);
  langRef.current = lang;

  const t = useCallback(
    (key: string, fallbackOrReplacements?: string | Record<string, string | number | undefined>): string => {
      const replacements = typeof fallbackOrReplacements === "object" ? fallbackOrReplacements : undefined;
      const fb = typeof fallbackOrReplacements === "string" ? fallbackOrReplacements : undefined;

      const entry = ((translationsRef.current as Record<string, unknown>)[key]
        ?? STOREFRONT_UI_COPY[namespace]?.[key]
        ?? ADMIN_UI_COPY[namespace]?.[key]) as Record<string, string> | undefined;
      const resolved = resolveTranslation(entry, langRef.current as Language, fb, key);

      return interpolate(resolved ?? fb ?? key, replacements);
    },
    [namespace],
  );

  return { t, lang, loadNamespace, translations };
}
