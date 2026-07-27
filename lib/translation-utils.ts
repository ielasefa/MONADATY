export type Language = "fr" | "en" | "ar";

export const DEFAULT_LANGUAGE: Language = "fr";

export function interpolate(
  template: string,
  replacements?: Record<string, string | number | undefined>,
): string {
  if (!replacements) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = replacements[key];
    return v != null ? String(v) : `{{${key}}}`;
  });
}

export function resolveTranslation(
  entry: Record<string, string> | undefined,
  lang: Language,
  fallback?: string,
  key?: string,
): string | undefined {
  if (!entry) return undefined;

  const val = entry[lang];
  if (val && val.trim()) return val;

  if (lang !== DEFAULT_LANGUAGE) {
    const frVal = entry[DEFAULT_LANGUAGE];
    if (frVal && frVal.trim()) return frVal;
  }

  if (fallback !== undefined) return fallback;

  return key;
}

export const NAMESPACES = [
  "common", "navbar", "footer", "home", "products", "collections",
  "checkout", "cart", "orders", "auth", "inventory", "landing",
  "validation", "errors", "buttons", "forms", "messages",
  "admin", "invoice", "system", "about", "shop", "success", "wishlist",
];
