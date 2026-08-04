"use server";

import { getSettings, saveSettings } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function saveSettingsAction(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const settings = await getSettings();

  const websiteName = (formData.get("websiteName") as string) || "";
  const logo = (formData.get("logo") as string) || "";
  const favicon = (formData.get("favicon") as string) || "";
  const contactEmail = (formData.get("contactEmail") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const address = (formData.get("address") as string) || "";
  const twitter = (formData.get("twitter") as string) || "";
  const instagram = (formData.get("instagram") as string) || "";
  const facebook = (formData.get("facebook") as string) || "";

  if (websiteName) settings.websiteName = websiteName;
  if (logo) settings.logo = logo;
  if (favicon) settings.favicon = favicon;
  if (contactEmail) settings.contactEmail = contactEmail;
  if (phone) settings.phone = phone;
  if (address) settings.address = address;
  if (twitter) settings.socialLinks.twitter = twitter;
  if (instagram) settings.socialLinks.instagram = instagram;
  if (facebook) settings.socialLinks.facebook = facebook;

  await saveSettings(settings);
  revalidatePath("/admin/settings");
}
