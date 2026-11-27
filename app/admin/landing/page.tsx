import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getAdminLanding, getFeaturedSectionEntries, getLandingCollections, getLatestLandingConfigId } from "@/lib/landing-cms";
import { getProducts } from "@/lib/db";
import { getLanguage } from "@/lib/translations";
import { landingAdminCopy } from "@/lib/landing-admin-copy";
import { isMissingCmsTable, loadLegacyFeaturedSelection } from "@/lib/featured-selection";
import { LandingCMS } from "./LandingCMS";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return { title: landingAdminCopy[await getLanguage()].title };
}

export default async function AdminLandingPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  let configId: string;
  try {
    configId = await getLatestLandingConfigId();
  } catch (error) {
    if (!isMissingCmsTable(error)) throw error;
    const selection = await loadLegacyFeaturedSelection();
    return <LandingCMS products={selection.products} initialProductIds={selection.productIds} />;
  }

  const [landingData, entries, collections, products] = await Promise.all([
    getAdminLanding(), getFeaturedSectionEntries(configId), getLandingCollections(), getProducts(),
  ]);
  const configuredIds = String(landingData.collectionHeader?.selectedCollectionIds || "").split(",").filter(Boolean);
  const validCollectionIds = configuredIds.filter(id => collections.some(collection => collection.id === id));
  const collectionIds = configuredIds.length > 0 ? validCollectionIds : collections.slice(0, 3).map(collection => collection.id);

  return <LandingCMS
    configId={configId}
    products={products.map(({ id, name, image, price }) => ({ id, name, image, price }))}
    initialProductIds={entries.map(entry => entry.productId)}
    collections={collections.map(({ id, name, image }) => ({ id, name, image }))}
    initialCollectionIds={collectionIds}
    published={landingData.status === "published"}
  />;
}
