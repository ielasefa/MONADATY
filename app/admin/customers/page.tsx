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
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0B0A]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <CustomersClient customers={customers} />
      </div>
    </div>
  );
}
