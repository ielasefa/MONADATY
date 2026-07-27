import { Footer } from "@/components/Footer";

export async function FooterWrapper() {
  let collections: { slug: string; name: string }[] = [];
  let settings: {
    websiteName: string;
    footer: { description: string; copyright: string; email: string; phone: string; address: string };
    socialLinks: { twitter: string; instagram: string; facebook: string };
  } | null = null;

  try {
    const [{ prisma }, { getSiteSettings }] = await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/db"),
    ]);
    const [dbCollections, dbSettings] = await Promise.all([
      prisma.collection.findMany({ orderBy: { order: "asc" }, select: { slug: true, name: true } }),
      getSiteSettings(),
    ]);
    collections = dbCollections;
    settings = dbSettings;
  } catch {
    // DB unavailable (build time, etc.) — render footer with minimal defaults
  }

  if (!settings) {
    return <Footer websiteName="MONADATY" collections={[]} settings={{}} />;
  }

  return (
    <Footer
      websiteName={settings.websiteName}
      collections={collections}
      settings={{
        description: settings.footer.description,
        copyright: settings.footer.copyright,
        email: settings.footer.email,
        phone: settings.footer.phone,
        address: settings.footer.address,
        socialLinks: settings.socialLinks,
      }}
    />
  );
}
