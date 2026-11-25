import type { Language } from "@/context/LanguageContext";

const labels: Record<string, Record<Language, string>> = {
  Water: { fr: "Eaux", en: "Water", ar: "المياه" },
  "Ice & Energy Drinks": { fr: "Boissons fraîches et énergétiques", en: "Ice & energy drinks", ar: "مشروبات باردة ومشروبات الطاقة" },
};

export function categoryLabel(name: string, language: Language): string {
  return labels[name]?.[language] || name;
}
