import type { Metadata } from "next";
import { getCollections } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { CollectionsClient } from "./CollectionsClient";
import { saveCollection, deleteCollection } from "@/lib/actions/admin-collections";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "collections_page_title", lang, "Collections — Admin") };
}

export default async function AdminCollectionsPage() {
  const collections = await getCollections();
  return <CollectionsClient collections={collections} saveCollection={saveCollection} deleteCollection={deleteCollection} />;
}
