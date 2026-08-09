import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { getAdminCollectionShowcase } from "@/lib/db";
import { CollectionShowcaseClient } from "./CollectionShowcaseClient";
import { saveCollectionShowcase } from "@/lib/actions/admin-collection-showcase";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "collection_showcase", lang, "Collection Showcase") };
}

export default async function AdminCollectionShowcasePage() {
  const collections = await getAdminCollectionShowcase();
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0B0A]">
      <div className="container-shell">
        <CollectionShowcaseClient
          collections={collections}
          saveCollectionShowcase={saveCollectionShowcase}
        />
      </div>
    </div>
  );
}
