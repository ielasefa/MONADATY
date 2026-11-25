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
      <header className="mb-6 border-b border-line pb-6">
        <p className="luxury-label text-accent">{getTranslation(translations, "configuration", lang, "Configuration")}</p>
        <h1 className="mt-2 text-foreground">{getTranslation(translations, "settings", lang, "Paramètres")}</h1>
        <p className="mt-1.5 text-sm text-secondary">{getTranslation(translations, "general_config", lang, "Configuration générale")}</p>
      </header>
      <SettingsForm settings={settings} saveSettingsAction={saveSettingsAction} />
    </div>
  );
}
