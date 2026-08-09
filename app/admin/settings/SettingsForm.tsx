"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import { SettingsFormWrapper } from "./SettingsFormWrapper";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { SiteSettings } from "@/types";

type Props = {
  settings: SiteSettings;
  saveSettingsAction: (formData: FormData) => Promise<void>;
};

export function SettingsForm({ settings, saveSettingsAction }: Props) {
  const { t } = useTranslation("admin");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await saveSettingsAction(new FormData(event.currentTarget));
      toast.success(t("settings_saved", "Settings saved successfully"));
    } catch {
      toast.error(t("settings_save_failed", "Failed to save settings"));
    }
  }

  return (
    <SettingsFormWrapper>
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          <section className="admin-panel p-5 sm:p-6">
            <SectionHeader title={t("store_identity", "Store identity")} description={t("store_identity_description", "Public store name and primary contact information.")} />
            <div className="mt-5 space-y-4">
              <Field label={t("website_name", "Website name")} name="websiteName" defaultValue={settings.websiteName} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={t("contact_email", "Contact email")} name="contactEmail" defaultValue={settings.contactEmail} />
                <Field label={t("phone_label", "Phone")} name="phone" defaultValue={settings.phone} />
              </div>
              <Field label={t("address_label", "Address")} name="address" defaultValue={settings.address} rows={3} />
            </div>
          </section>

          <section className="admin-panel p-5 sm:p-6">
            <SectionHeader title={t("social_links", "Social links")} description={t("social_links_description", "Connect the customer-facing social profiles.")} />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t("twitter", "Twitter")} name="twitter" defaultValue={settings.socialLinks?.twitter || ""} />
              <Field label={t("instagram", "Instagram")} name="instagram" defaultValue={settings.socialLinks?.instagram || ""} />
              <Field label={t("facebook", "Facebook")} name="facebook" defaultValue={settings.socialLinks?.facebook || ""} />
            </div>
          </section>
        </div>

        <aside className="admin-panel h-fit min-w-0 p-5 sm:p-6 xl:sticky xl:top-20">
          <SectionHeader title={t("brand_assets", "Brand assets")} description={t("brand_assets_description", "Upload controlled logo and favicon files.")} />
          <div className="mt-5 space-y-6">
            <div>
              <SingleImageUploader
                label={t("logo_label", "Logo")}
                value={settings.logo}
                onChange={(url) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="logo"]');
                  if (input) input.value = url;
                }}
                folder="settings"
                className="[&>div]:max-h-56 [&_img]:h-48"
              />
              <input type="hidden" name="logo" defaultValue={settings.logo} />
            </div>
            <div className="border-t border-white/[0.08] pt-5">
              <SingleImageUploader
                label={t("favicon_label", "Favicon")}
                value={settings.favicon}
                onChange={(url) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="favicon"]');
                  if (input) input.value = url;
                }}
                folder="settings"
                aspectRatio="1/1"
                className="max-w-48 [&>div]:max-h-48 [&_img]:h-44"
              />
              <input type="hidden" name="favicon" defaultValue={settings.favicon} />
            </div>
          </div>
        </aside>

        <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-end xl:col-span-2">
          <p className="text-xs text-white/35 sm:me-auto">{t("settings_save_hint", "Changes are applied after saving.")}</p>
          <button type="submit" className="btn-primary w-full px-6 sm:w-auto">{t("save_settings", "Save settings")}</button>
        </div>
      </form>
    </SettingsFormWrapper>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-white/[0.08] pb-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-white/40">{description}</p>
    </div>
  );
}

function Field({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={`settings-${name}`} className="luxury-label">{label}</label>
      {rows ? (
        <textarea id={`settings-${name}`} name={name} defaultValue={defaultValue} rows={rows} className="input-premium min-h-[96px] w-full resize-y px-4 py-3" />
      ) : (
        <input id={`settings-${name}`} name={name} defaultValue={defaultValue} className="input-premium w-full px-4" />
      )}
    </div>
  );
}
