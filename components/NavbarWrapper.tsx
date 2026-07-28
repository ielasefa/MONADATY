import { Navbar } from "@/components/Navbar";
import { isAuthenticated } from "@/lib/auth";
import type { CollectionData } from "@/types";

export async function NavbarWrapper() {
  let mapped: CollectionData[] = [];
  let websiteName = "MONADATY";
  let isAdmin = false;

  try {
    const [{ prisma }, { getSiteSettings }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/db"),
    ]);
    const [collections, settings, authResult] = await Promise.all([
      prisma.collection.findMany({
        orderBy: { order: "asc" },
        select: {
          slug: true, name: true, description: true, accent: true,
          tone: true, previewLabel: true, image: true, order: true,
        },
      }),
      getSiteSettings(),
      isAuthenticated(),
    ]);

    mapped = collections.map((c) => ({
      slug: c.slug,
      title: c.name,
      description: c.description,
      accent: c.accent,
      tone: c.tone,
      previewLabel: c.previewLabel,
      image: c.image || "",
      order: c.order,
    }));
    websiteName = settings.websiteName;
    isAdmin = !!authResult;
  } catch {
    // DB unavailable (build time, etc.) — render navbar with minimal defaults
  }

  return <Navbar collections={mapped} websiteName={websiteName} isAdmin={isAdmin} />;
}
