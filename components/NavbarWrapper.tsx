import { Navbar } from "@/components/Navbar";

export async function NavbarWrapper() {
  let categories: { slug: string; name: string }[] = [];
  let websiteName = "MONADATY";
  try {
    const { getSiteSettings, getCategories, getProducts } = await import("@/lib/db");
    const [settings, categoryRows, products] = await Promise.all([
      getSiteSettings(), getCategories(), getProducts(),
    ]);
    websiteName = settings.websiteName;
    categories = categoryRows.filter((category) => products.some((product) => product.category === category.name))
      .map(({ slug, name }) => ({ slug, name }));
  } catch {
    // DB unavailable (build time, etc.) — render navbar with minimal defaults
  }

  return <Navbar categories={categories} websiteName={websiteName} />;
}
