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
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="luxury-label mb-2">{getTranslation(translations, "configuration", lang, "Configuration")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{getTranslation(translations, "settings", lang, "Paramètres")}</h1>
        <p className="mt-1 text-sm text-muted">{getTranslation(translations, "general_config", lang, "Configuration générale")}</p>
      </div>
      <SettingsForm settings={settings} saveSettingsAction={saveSettingsAction} />
    </div>
  );
}
