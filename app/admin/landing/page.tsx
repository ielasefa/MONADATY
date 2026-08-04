import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getTestimonials } from "@/lib/data";
import {
  getAdminLanding,
  getFeaturedSectionEntries,
  getLandingCollections,
  getLatestLandingConfigId,
  getVersions,
} from "@/lib/landing-cms";
import { LandingCMS } from "./LandingCMS";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { getLanguage, getTranslation, loadTranslations } = await import("@/lib/translations");
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "landing_page_title", lang, "Landing Page CMS") };
}

export default async function AdminLandingPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");

  const configId = await getLatestLandingConfigId();

  const [landingData, testimonials, featuredEntries, versions, allCollections] = await Promise.all([
    getAdminLanding(),
    getTestimonials(),
    getFeaturedSectionEntries(configId),
    getVersions(configId),
    getLandingCollections(),
  ]);

  return (
    <LandingCMS
      configId={configId}
      landingData={landingData}
      testimonials={testimonials}
      featuredEntries={featuredEntries}
      allCollections={allCollections}
      versions={versions.map((v: { id: string; version: number; status: string; label: string; createdBy: string; createdAt: Date | string }) => ({
        id: v.id,
        version: v.version,
        status: v.status,
        label: v.label,
        createdBy: v.createdBy,
        createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
      }))}
    />
  );
}
