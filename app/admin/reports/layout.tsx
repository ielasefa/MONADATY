import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "reports", lang, "Reports") };
}

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
