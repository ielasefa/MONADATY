import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

async function login(page: Page) {
  await page.goto("/admin/login");
  const origin = new URL(page.url()).origin;
  expect(["localhost", "127.0.0.1"]).toContain(new URL(origin).hostname);
  const response = await page.request.post("/api/admin/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    headers: { Origin: origin },
  });
  expect(response.status()).toBe(200);
  await page.context().addCookies([{ name: "admin_must_change", value: "0", domain: new URL(origin).hostname, path: "/" }]);
}

async function createProduct(request: APIRequestContext, origin: string, data: Record<string, unknown>) {
  const response = await request.post("/api/admin/products", { data, headers: { Origin: origin } });
  expect(response.status()).toBe(201);
  return (await response.json()).product as { id: string; name: string };
}

test("storefront and admin product search, stock, pagination and navigation stay synchronized", async ({ page }) => {
  test.setTimeout(180_000);
  await login(page);
  const origin = new URL(page.url()).origin;
  const suffix = `${Date.now()}`;
  const createdIds: string[] = [];

  try {
    const priorResponse = await page.request.get("/api/admin/products/list?search=E2E&pageSize=100");
    if (priorResponse.ok()) {
      const priorProducts = (await priorResponse.json()).products as { id: string; name: string }[];
      for (const product of priorProducts.filter(({ name }) => /^E2E (Coca Cola (Low|Full)|Water Out) \d+$/.test(name))) {
        await page.request.delete(`/api/admin/products/${product.id}`, { headers: { Origin: origin } });
      }
    }

    const categoriesResponse = await page.request.get("/api/admin/categories/list");
    expect(categoriesResponse.ok()).toBe(true);
    const categories = (await categoriesResponse.json()).categories as { id: string; name: string; slug: string }[];
    expect(categories.length).toBeGreaterThan(0);
    const category = categories[0];

    const fixtures = [
      { name: `E2E Coca Cola Low ${suffix}`, sku: `E2E-COCA-LOW-${suffix}`, stock: 6, lowStockThreshold: 7 },
      { name: `E2E Coca Cola Full ${suffix}`, sku: `E2E-COCA-FULL-${suffix}`, stock: 4, lowStockThreshold: 3 },
      { name: `E2E Water Out ${suffix}`, sku: `E2E-WATER-OUT-${suffix}`, stock: 0, lowStockThreshold: 3 },
    ];
    for (const fixture of fixtures) {
      const product = await createProduct(page.request, origin, {
        ...fixture,
        regularPrice: "10.00 DH",
        categoryId: category.id,
        status: "Active",
      });
      createdIds.push(product.id);
    }

    await page.goto(`/admin/products?search=${encodeURIComponent(`coca cola low ${suffix}`)}&stock=low`);
    await expect(page.getByRole("link", { name: `E2E Coca Cola Low ${suffix}`, exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("product-stock").first()).toContainText(/Low stock|Stock faible/i);
    await expect(page.getByTestId("product-total")).toContainText("1");
    await expect(page.getByRole("link", { name: `E2E Coca Cola Full ${suffix}`, exact: true })).toHaveCount(0);
    const adminDocumentStart = await page.evaluate(() => performance.timeOrigin);

    await page.getByTestId("product-clear-filters").click();
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.getByTestId("product-search").fill(`water out ${suffix}`);
    await page.getByTestId("product-stock-filter").selectOption("out");
    await expect(page).toHaveURL(/stock=out/);
    await expect.poll(() => new URL(page.url()).searchParams.get("search")).toBe(`water out ${suffix}`);
    await expect(page.getByRole("link", { name: `E2E Water Out ${suffix}`, exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("product-stock").first()).toContainText(/Out of stock|Rupture de stock/i);
    await page.getByTestId("product-stock-filter").selectOption("low");
    await page.getByTestId("product-search").fill(`coca cola low ${suffix}`);
    await expect(page).toHaveURL(/stock=low/);
    await expect(page.getByRole("link", { name: `E2E Coca Cola Low ${suffix}`, exact: true }).first()).toBeVisible();

    await page.getByTestId("product-search").fill(`  COCA   COLA   LOW ${suffix}  `);
    await expect(page).toHaveURL(/search=COCA(?:\+|%20)COLA(?:\+|%20)LOW/);
    await expect(page.getByRole("link", { name: `E2E Coca Cola Low ${suffix}`, exact: true }).first()).toBeVisible();

    await page.getByTestId("product-category-filter").selectOption(category.id);
    await expect(page).toHaveURL(new RegExp(`categoryId=${category.id}`));
    await expect(page).toHaveURL(/stock=low/);
    await expect(page.getByRole("link", { name: `E2E Coca Cola Low ${suffix}`, exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(adminDocumentStart);

    await page.goto(`/admin/products?search=${suffix}&sort=name-asc&pageSize=1`);
    const paginatedDocumentStart = await page.evaluate(() => performance.timeOrigin);
    await expect(page.getByTestId("product-total")).toContainText("3");
    await page.getByTestId("product-page-next").click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page).toHaveURL(/pageSize=1/);
    await expect(page).toHaveURL(new RegExp(`search=${suffix}`));
    await expect(page).toHaveURL(/sort=name-asc/);

    const currentProduct = page.locator('a[href*="/admin/products/"][href$="/edit"]:visible').first();
    await expect(currentProduct).toBeVisible();
    await currentProduct.click();
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+\/edit/);
    await page.goBack();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByTestId("product-search")).toHaveValue(suffix);
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(paginatedDocumentStart);

    await page.goto("/shop");
    const storefrontDocumentStart = await page.evaluate(() => performance.timeOrigin);
    const storefrontSearch = page.getByTestId("storefront-product-search");
    await storefrontSearch.fill(`  coca   cola   low ${suffix} `);
    await page.getByRole("button", { name: category.name, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`collection=${category.slug}`));
    await expect.poll(() => new URL(page.url()).searchParams.get("search")).toBe(`coca cola low ${suffix}`);
    await expect(page.getByText(`E2E Coca Cola Low ${suffix}`, { exact: true }).first()).toBeVisible();
    await storefrontSearch.fill(category.name.toUpperCase());
    await expect(page.getByText(`E2E Coca Cola Low ${suffix}`, { exact: true }).first()).toBeVisible();
    await storefrontSearch.fill("");
    await expect(page.getByText(`E2E Water Out ${suffix}`, { exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(storefrontDocumentStart);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(storefrontSearch).toBeVisible();
      await expect(page.getByRole("button", { name: category.name, exact: true }).first()).toBeVisible();
      await expect(page.getByTestId("storefront-product-results")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `storefront ${viewport.width}x${viewport.height} horizontal overflow`).toBeLessThanOrEqual(1);
    }

    await page.goto(`/admin/products?search=${encodeURIComponent(`coca cola low ${suffix}`)}&stock=low`);
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await expect(page.getByTestId("product-search")).toBeVisible();
      await expect(page.locator('[data-testid="product-stock"]:visible').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `admin ${viewport.width}x${viewport.height} horizontal overflow`).toBeLessThanOrEqual(1);
    }
  } finally {
    for (const id of createdIds) {
      await page.request.delete(`/api/admin/products/${id}`, { headers: { Origin: origin } });
    }
  }
});
