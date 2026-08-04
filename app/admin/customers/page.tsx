import type { Metadata } from "next";
import { getCustomers } from "@/lib/customers";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { CustomersClient } from "./CustomersClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "customers", lang, "Clients") };
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return (
    <div className="min-h-screen bg-bg">
      <div className="container-shell mx-auto px-6 py-10">
        <CustomersClient customers={customers} />
      </div>
    </div>
  );
}
