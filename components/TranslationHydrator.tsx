"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TranslationNamespaces, TranslationTable } from "@/lib/translations";

type Props = {
  children: ReactNode;
  initialTranslations: TranslationNamespaces;
};

type TranslationStore = {
  namespaces: TranslationNamespaces;
  loadNamespace: (namespace: string) => Promise<void>;
};

const EMPTY_TRANSLATIONS: TranslationTable = {};
const TranslationContext = createContext<TranslationStore | null>(null);

export function TranslationProvider({ children, initialTranslations }: Props) {
  const [namespaces, setNamespaces] = useState(initialTranslations);
  const namespacesRef = useRef(namespaces);
  namespacesRef.current = namespaces;
  const pendingLoads = useRef(new Map<string, Promise<void>>());

  const loadNamespace = useCallback((namespace: string) => {
    if (Object.prototype.hasOwnProperty.call(namespacesRef.current, namespace)) {
      return Promise.resolve();
    }

    const pending = pendingLoads.current.get(namespace);
    if (pending) return pending;

    const request = fetch(`/api/translations?namespace=${encodeURIComponent(namespace)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Unable to load translations for ${namespace}`);
        }
        const json = await response.json() as { translations?: TranslationTable };
        const translations = json.translations ?? EMPTY_TRANSLATIONS;
        setNamespaces((current) => ({ ...current, [namespace]: translations }));
      })
      .catch(() => {
        // Existing component fallbacks remain usable if a namespace request fails.
      })
      .finally(() => {
        pendingLoads.current.delete(namespace);
      });

    pendingLoads.current.set(namespace, request);
    return request;
  }, []);

  const value = useMemo(
    () => ({ namespaces, loadNamespace }),
    [loadNamespace, namespaces],
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationNamespace(namespace: string) {
  const store = useContext(TranslationContext);

  useEffect(() => {
    if (!store || Object.prototype.hasOwnProperty.call(store.namespaces, namespace)) return;
    void store.loadNamespace(namespace);
  }, [namespace, store]);

  return {
    translations: store?.namespaces[namespace] ?? EMPTY_TRANSLATIONS,
    loadNamespace: store?.loadNamespace ?? (async () => {}),
  };
}
