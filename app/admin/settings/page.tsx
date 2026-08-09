import { getSettings } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import type { Metadata } from "next";
import { SettingsForm } from "./SettingsForm";
import { saveSettingsAction } from "@/lib/actions/admin-settings";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "settings_page_title", lang, "Paramètres — Admin") };
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  const lang = await getLanguage();
  const translations = await loadTranslations("admin");

  return (
    <div className="container-shell">
      <header className="mb-6 border-b border-white/[0.08] pb-6">
        <p className="luxury-label text-[#D6B35A]/75">{getTranslation(translations, "configuration", lang, "Configuration")}</p>
        <h1 className="mt-2 text-white">{getTranslation(translations, "settings", lang, "Paramètres")}</h1>
        <p className="mt-1.5 text-sm text-white/45">{getTranslation(translations, "general_config", lang, "Configuration générale")}</p>
      </header>
      <SettingsForm settings={settings} saveSettingsAction={saveSettingsAction} />
    </div>
  );
}
