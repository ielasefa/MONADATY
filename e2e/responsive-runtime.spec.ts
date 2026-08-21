import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3458";
const ORIGIN = new URL(BASE_URL).origin;

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

async function expectNoPageOverflow(page: Page, route: string, width: number) {
  await page.goto(route, { waitUntil: "load" });
  await expect(page.locator("main").first()).toBeVisible();
  await page.waitForFunction(() => document.fonts.status === "loaded");
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(dimensions.scrollWidth, `${route} overflows at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.bodyScrollWidth, `${route} body overflows at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function loginViaApi(page: Page) {
  const response = await page.request.post(`${ORIGIN}/api/admin/login`, {
    headers: { Origin: ORIGIN },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);
}

for (const viewport of VIEWPORTS) {
  test(`routes fit ${viewport.width}x${viewport.height} without overflow`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    await page.goto("/shop", { waitUntil: "domcontentloaded" });
    const productPath = await page.locator('a[href^="/product/"]').first().getAttribute("href");
    expect(productPath).toBeTruthy();

    await loginViaApi(page);
    const editPath = await page.evaluate(async () => {
      const response = await fetch("/api/admin/products/list");
      if (!response.ok) return "";
      const data = await response.json();
      const first = (data.products || [])[0];
      return first ? `/admin/products/${first.id}/edit` : "";
    });

    const publicRoutes = ["/", "/shop", productPath!, "/checkout", "/admin/login"];
    const adminRoutes = [
      "/admin/dashboard",
      "/admin/products",
      "/admin/products/add",
      ...(editPath ? [editPath] : []),
      "/admin/landing",
    ];

    for (const route of [...publicRoutes, ...adminRoutes]) {
      await expectNoPageOverflow(page, route, viewport.width);
    }
  });
}

test("mobile menus release body scroll and navigation does not reload the document", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const count = Number(sessionStorage.getItem("document-load-count") || "0") + 1;
    sessionStorage.setItem("document-load-count", String(count));
  });

  await page.goto("/", { waitUntil: "load" });
  const storefrontMenu = page.locator('button[aria-controls="mobile-menu"]');
  await storefrontMenu.click();
  await expect(storefrontMenu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(storefrontMenu).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

  await page.locator('a[href="/shop"]:visible').first().click();
  await page.waitForURL(/\/shop/);
  await page.locator('a[href^="/product/"]:visible').first().click();
  await page.waitForURL(/\/product\//);
  await page.getByTestId("buy-now").click();
  await page.waitForURL(/\/checkout/, { waitUntil: "commit" });
  expect(await page.evaluate(() => sessionStorage.getItem("document-load-count"))).toBe("1");

  await loginViaApi(page);
  await page.goto("/admin/dashboard", { waitUntil: "load" });
  const adminMenu = page.locator('button[aria-controls="admin-sidebar"]');
  await adminMenu.click();
  await expect(adminMenu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(adminMenu).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("login, admin navigation, and logout complete without manual refresh", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/login", { waitUntil: "networkidle" });
  await page.fill("#login-email", ADMIN_EMAIL);
  await page.fill("#login-password", ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/);

  const adminMenu = page.locator('button[aria-controls="admin-sidebar"]');
  await adminMenu.click();
  await page.locator('#admin-sidebar a[href="/admin/products"]').click();
  await page.waitForURL(/\/admin\/products$/);

  await adminMenu.click();
  await page.locator('#admin-sidebar button[title]').last().click();
  await page.waitForURL(/\/admin\/login/);
  await expect(page.locator("#login-email")).toBeVisible();
});
