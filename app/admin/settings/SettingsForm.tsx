"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { SettingsFormWrapper } from "./SettingsFormWrapper";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { SiteSettings } from "@/types";

type Props = {
  settings: SiteSettings;
  saveSettingsAction: (formData: FormData) => Promise<void>;
};

export function SettingsForm({ settings, saveSettingsAction }: Props) {
  const { t } = useTranslation("admin");

  return (
    <SettingsFormWrapper>
      <div className="luxury-card mb-10 p-8">
        <form action={saveSettingsAction} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("website_name")} name="websiteName" defaultValue={settings.websiteName} />
            <SingleImageUploader
              label={t("logo_label")}
              value={settings.logo}
              onChange={(url) => {
                const input = document.querySelector<HTMLInputElement>('input[name="logo"]');
                if (input) input.value = url;
              }}
               folder="settings"
            />
            <input type="hidden" name="logo" defaultValue={settings.logo} />
          </div>
          <SingleImageUploader
            label={t("favicon_label")}
            value={settings.favicon}
            onChange={(url) => {
              const input = document.querySelector<HTMLInputElement>('input[name="favicon"]');
              if (input) input.value = url;
            }}
             folder="settings"
            aspectRatio="1/1"
          />
          <input type="hidden" name="favicon" defaultValue={settings.favicon} />
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("contact_email")} name="contactEmail" defaultValue={settings.contactEmail} />
            <Field label={t("phone_label")} name="phone" defaultValue={settings.phone} />
          </div>
          <Field label={t("address_label")} name="address" defaultValue={settings.address} rows={2} />

          <div className="divider-gold pt-4">
            <h3 className="luxury-label mb-4">{t("social_links")}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label={t("twitter")} name="twitter" defaultValue={settings.socialLinks?.twitter || ""} />
              <Field label={t("instagram")} name="instagram" defaultValue={settings.socialLinks?.instagram || ""} />
              <Field label={t("facebook")} name="facebook" defaultValue={settings.socialLinks?.facebook || ""} />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-2">
            {t("save_settings")}
          </button>
        </form>
      </div>
    </SettingsFormWrapper>
  );
}

function Field({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="space-y-2">
      <label className="luxury-label">{label}</label>
      {rows ? (
        <textarea name={name} defaultValue={defaultValue} rows={rows} className="input-premium w-full px-4 py-3 min-h-[80px] resize-y" />
      ) : (
        <input name={name} defaultValue={defaultValue} className="input-premium w-full px-4 py-2.5" />
      )}
    </div>
  );
}
