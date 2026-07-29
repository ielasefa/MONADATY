"use client";

import { useLanguage, type Language } from "@/context/LanguageContext";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { interpolate, resolveTranslation } from "@/lib/translation-utils";

const translationStore = new Map<string, Record<string, Record<string, string>>>();
const listeners = new Set<() => void>();
const EMPTY_TRANSLATIONS: Record<string, Record<string, string>> = {};
const pendingLoads = new Set<string>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(namespace: string) {
  return translationStore.get(namespace) ?? EMPTY_TRANSLATIONS;
}

export function setTranslations(namespace: string, data: Record<string, Record<string, string>>) {
  translationStore.set(namespace, data);
  listeners.forEach((cb) => cb());
}

export function useTranslation(namespace = "common") {
  const { lang } = useLanguage();

  const getSnap = useCallback(() => getSnapshot(namespace), [namespace]);
  const getServerSnap = useCallback(() => getSnapshot(namespace), [namespace]);

  const translations = useSyncExternalStore(subscribe, getSnap, getServerSnap);

  const translationsRef = useRef(translations);
  translationsRef.current = translations;
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    if (pendingLoads.has(namespace)) return;
    if (translationStore.has(namespace)) return;
    pendingLoads.add(namespace);

    const controller = new AbortController();

    fetch(`/api/translations?namespace=${namespace}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json) setTranslations(namespace, json.translations);
      })
      .catch(() => {})
      .finally(() => pendingLoads.delete(namespace));

    return () => {
      controller.abort();
      pendingLoads.delete(namespace);
    };
  }, [namespace]);

  const t = useCallback(
    (key: string, fallbackOrReplacements?: string | Record<string, string | number | undefined>): string => {
      const replacements = typeof fallbackOrReplacements === "object" ? fallbackOrReplacements : undefined;
      const fb = typeof fallbackOrReplacements === "string" ? fallbackOrReplacements : undefined;

      const entry = (translationsRef.current as Record<string, unknown>)[key] as Record<string, string> | undefined;
      const resolved = resolveTranslation(entry, langRef.current as Language, fb, key);

      return interpolate(resolved ?? fb ?? key, replacements);
    },
    [],
  );

  const loadNamespace = useCallback(async (ns: string) => {
    if (pendingLoads.has(ns)) return;
    if (translationStore.has(ns)) return;
    pendingLoads.add(ns);
    const controller = new AbortController();
    try {
      const res = await fetch(`/api/translations?namespace=${ns}`, { signal: controller.signal });
      if (res.ok) {
        const json = await res.json();
        setTranslations(ns, json.translations);
      }
    } catch {}
    pendingLoads.delete(ns);
    return () => controller.abort();
  }, []);

  return { t, lang, loadNamespace, translations };
}
