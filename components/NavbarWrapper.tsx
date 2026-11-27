import { Navbar, type NavbarCategory } from "@/components/Navbar";

export async function NavbarWrapper() {
  let categories: NavbarCategory[] = [];
  let websiteName = "MONADATY";
  let logoUrl = "";
  try {
    const { getSiteSettings, getCategories, getProducts } = await import("@/lib/db");
    const [settings, categoryRows, products] = await Promise.all([
      getSiteSettings(), getCategories(), getProducts(),
    ]);
    websiteName = settings.websiteName;
    logoUrl = settings.logo;
    categories = categoryRows.map((category) => {
      const matchingProducts = products.filter((product) => product.category === category.name);
      const productImage = matchingProducts.find((product) => product.image)?.image;
      return {
        slug: category.slug,
        name: category.name,
        count: matchingProducts.length,
        image: category.image || productImage,
        productImage: !category.image && Boolean(productImage),
      };
    }).filter((category) => category.count > 0);
  } catch {
    // DB unavailable (build time, etc.) — render navbar with minimal defaults
  }

  return <Navbar categories={categories} websiteName={websiteName} logoUrl={logoUrl} />;
}
