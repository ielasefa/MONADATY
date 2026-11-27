import { getSiteSettings } from "@/lib/db";
import { getLanguage } from "@/lib/translations";
import { changePasswordCopy } from "@/lib/change-password-copy";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export async function generateMetadata() {
  return { title: changePasswordCopy[await getLanguage()].title };
}

export default async function ChangePasswordPage() {
  const settings = await getSiteSettings().catch(() => null);
  return <ChangePasswordForm logoUrl={settings?.logo || ""} />;
}
