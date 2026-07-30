import { Navbar } from "@/components/Navbar";
import type { CollectionData } from "@/types";

export async function NavbarWrapper() {
  let mapped: CollectionData[] = [];
  let websiteName = "MONADATY";
  try {
    const [{ prisma }, { getSiteSettings }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/db"),
    ]);
    const [collections, settings] = await Promise.all([
      prisma.collection.findMany({
        orderBy: { order: "asc" },
        select: {
          slug: true, name: true, description: true, accent: true,
          tone: true, previewLabel: true, image: true, order: true,
        },
      }),
      getSiteSettings(),
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
  } catch {
    // DB unavailable (build time, etc.) — render navbar with minimal defaults
  }

  return <Navbar collections={mapped} websiteName={websiteName} />;
}
