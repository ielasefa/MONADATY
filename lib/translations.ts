import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { interpolate, resolveTranslation, NAMESPACES, type Language, DEFAULT_LANGUAGE } from "./translation-utils";

export type { Language };
export { DEFAULT_LANGUAGE };

export const SUPPORTED_LANGUAGES: Language[] = ["fr", "en", "ar"];
export const LANGUAGE_COOKIE = "monadaty_lang";

export function getLanguageFromCookie(cookieValue?: string): Language {
  if (cookieValue && SUPPORTED_LANGUAGES.includes(cookieValue as Language)) {
    return cookieValue as Language;
  }
  return DEFAULT_LANGUAGE;
}

export async function getLanguage(): Promise<Language> {
  try {
    const cookieStore = await cookies();
    const lang = cookieStore.get(LANGUAGE_COOKIE)?.value;
    return getLanguageFromCookie(lang);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export async function loadTranslations(namespace: string): Promise<Record<string, string>> {
  try {
    const rows = await prisma.translation.findMany({
      where: { namespace },
      select: { key: true, fr: true, en: true, ar: true },
    });

    const translations: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      translations[row.key] = { fr: row.fr, en: row.en, ar: row.ar };
    }

    return translations as unknown as Record<string, string>;
  } catch {
    return {};
  }
}

export function getTranslation(
  translations: Record<string, Record<string, string>> | Record<string, string>,
  key: string,
  lang: Language = DEFAULT_LANGUAGE,
  fallback?: string,
  replacements?: Record<string, string | number | undefined>,
): string {
  const entry = (translations as Record<string, unknown>)[key] as Record<string, string> | string | undefined;

  if (typeof entry === "string") {
    return interpolate(entry, replacements);
  }

  const resolved = resolveTranslation(entry, lang, fallback, key);
  return interpolate(resolved ?? key, replacements);
}

export function t(
  translations: Record<string, Record<string, string>> | Record<string, string>,
  key: string,
  lang: Language = DEFAULT_LANGUAGE,
): string {
  return getTranslation(translations, key, lang, key);
}

export async function translate(
  key: string,
  namespace: string = "common",
  lang: Language = DEFAULT_LANGUAGE,
  replacements?: Record<string, string | number | undefined>,
): Promise<string> {
  try {
    const row = await prisma.translation.findUnique({
      where: { key_namespace: { key, namespace } },
      select: { fr: true, en: true, ar: true },
    });
    if (!row) return key;
    const entry = { fr: row.fr, en: row.en, ar: row.ar };
    const resolved = resolveTranslation(entry, lang, undefined, key);
    return interpolate(resolved ?? key, replacements);
  } catch {
    return key;
  }
}

export async function getAllTranslations(options?: {
  namespace?: string;
  search?: string;
  missing?: string;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};
  if (options?.namespace) where.namespace = options.namespace;
  if (options?.search) {
    where.OR = [
      { key: { contains: options.search } },
      { fr: { contains: options.search } },
      { en: { contains: options.search } },
      { ar: { contains: options.search } },
    ];
  }
  if (options?.missing === "fr") where.fr = "";
  if (options?.missing === "en") where.en = "";
  if (options?.missing === "ar") where.ar = "";

  const [rows, total] = await Promise.all([
    prisma.translation.findMany({
      where,
      orderBy: [{ namespace: "asc" }, { key: "asc" }],
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    }),
    prisma.translation.count({ where }),
  ]);

  return { rows, total };
}

export async function getTranslationStats() {
  const total = await prisma.translation.count();
  const [withFr, withEn, withAr] = await Promise.all([
    prisma.translation.count({ where: { fr: { not: "" } } }),
    prisma.translation.count({ where: { en: { not: "" } } }),
    prisma.translation.count({ where: { ar: { not: "" } } }),
  ]);

  const namespaceCounts = await prisma.translation.groupBy({
    by: ["namespace"],
    _count: true,
  });

  return {
    total,
    fr: { translated: withFr, missing: total - withFr, coverage: total > 0 ? Math.round((withFr / total) * 100) : 0 },
    en: { translated: withEn, missing: total - withEn, coverage: total > 0 ? Math.round((withEn / total) * 100) : 0 },
    ar: { translated: withAr, missing: total - withAr, coverage: total > 0 ? Math.round((withAr / total) * 100) : 0 },
    namespaces: namespaceCounts.map(n => ({ namespace: n.namespace, count: n._count })),
  };
}

export async function updateTranslation(
  id: string,
  data: { fr?: string; en?: string; ar?: string; description?: string },
  admin?: { id: string; name: string; ip?: string; browser?: string },
) {
  const old = await prisma.translation.findUnique({ where: { id } });
  if (!old) throw new Error("Translation not found");

  await prisma.translation.update({ where: { id }, data });

  if (admin) {
    for (const field of ["fr", "en", "ar", "description"] as const) {
      const oldVal = old[field];
      const newVal = data[field];
      if (newVal !== undefined && oldVal !== newVal) {
        await prisma.translationHistory.create({
          data: {
            translationId: id,
            key: old.key,
            namespace: old.namespace,
            field,
            oldValue: oldVal ?? "",
            newValue: newVal ?? "",
            adminId: admin.id,
            adminName: admin.name,
            ip: admin.ip ?? "",
            browser: admin.browser ?? "",
          },
        });
      }
    }
  }

}

export async function upsertTranslation(data: {
  key: string;
  namespace: string;
  fr?: string;
  en?: string;
  ar?: string;
  description?: string;
}) {
  const result = await prisma.translation.upsert({
    where: { key_namespace: { key: data.key, namespace: data.namespace } },
    update: {
      fr: data.fr ?? undefined,
      en: data.en ?? undefined,
      ar: data.ar ?? undefined,
      description: data.description ?? undefined,
    },
    create: {
      key: data.key,
      namespace: data.namespace,
      fr: data.fr ?? "",
      en: data.en ?? "",
      ar: data.ar ?? "",
      description: data.description ?? "",
    },
  });

  return result;
}

export async function deleteTranslation(id: string) {
  const t = await prisma.translation.findUnique({ where: { id } });
  if (!t) throw new Error("Translation not found");
  await prisma.translation.delete({ where: { id } });
}

export { NAMESPACES };
