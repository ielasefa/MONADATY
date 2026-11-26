import { getSiteSettings } from "@/lib/db";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const settings = await getSiteSettings().catch(() => null);
  return <ChangePasswordForm logoUrl={settings?.logo || ""} />;
}
