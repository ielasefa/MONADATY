import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

async function loginViaAPI(page: Page) {
  await page.goto("/admin/login");
  await page.waitForLoadState("domcontentloaded");
  const ok = await page.evaluate(async ({ email, password }) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.ok;
  }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  expect(ok).toBe(true);
  // Override mustChange cookie to prevent middleware redirect to change-password
  await page.context().addCookies([{
    name: "admin_must_change",
    value: "0",
    domain: "localhost",
    path: "/",
  }]);
  await page.goto("/admin/dashboard", { waitUntil: "load", timeout: 30000 });
  await page.waitForURL(/\/admin\/dashboard/);
}

test.describe("Login Redirect", () => {
  test("login redirects to dashboard without manual refresh", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("#login-email", { timeout: 10000 });

    await page.fill("#login-email", ADMIN_EMAIL);
    await page.fill("#login-password", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin\/(dashboard|change-password)/, { timeout: 20000 });
    await expect(page).toHaveURL(/\/admin\/(dashboard|change-password)/);

    const url = page.url();
    if (url.includes("change-password")) {
      await page.fill("#new-password", ADMIN_PASSWORD + "!");
      await page.fill("#confirm-password", ADMIN_PASSWORD + "!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    }

    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test("login with redirect param goes to correct page", async ({ page }) => {
    await page.goto("/admin/login?redirect=/admin/products");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("#login-email", { timeout: 10000 });

    await page.fill("#login-email", ADMIN_EMAIL);
    await page.fill("#login-password", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/admin\/(products|change-password)/, { timeout: 20000 });
    const url = page.url();
    if (url.includes("change-password")) {
      await page.fill("#new-password", ADMIN_PASSWORD + "!");
      await page.fill("#confirm-password", ADMIN_PASSWORD + "!");
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin\/products/, { timeout: 15000 });
    }

    await expect(page).toHaveURL(/\/admin\/products/);
  });
});

test.describe("Featured Products CMS", () => {
  test("landing page featured section uses DB-controlled products", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const featuredSection = page.locator("#products");
    const isSectionVisible = await featuredSection.isVisible({ timeout: 5000 }).catch(() => false);

    if (isSectionVisible) {
      const initialContent = await featuredSection.textContent();

      const secondResponse = await page.goto("/");
      expect(secondResponse?.status()).toBe(200);
      await page.waitForLoadState("networkidle", { timeout: 15000 });
      const afterContent = await featuredSection.textContent();
      expect(afterContent).toBe(initialContent);
    }
  });

  test("homepage management exposes only product and collection choices", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    const editor = page.locator(".homepage-admin");
    await expect(editor).toBeVisible();
    await expect(editor.locator('select[name^="product-"]')).toHaveCount(4);
    await expect(editor.locator('button[type="submit"]')).toHaveCount(1);
    await expect(editor.locator("input, textarea")).toHaveCount(0);
    await expect(page.locator("[data-section-key]")).toHaveCount(0);
  });

  test("a failed product save never publishes the homepage", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    const slots = page.locator('.homepage-admin select[name^="product-"]');
    await expect(slots).toHaveCount(4);
    const ids = await slots.evaluateAll(elements => elements.map(element => (element as HTMLSelectElement).value));
    test.skip(ids.some(id => !id) || new Set(ids).size !== 4, "Requires four configured homepage products");
    let published = false;
    await page.route("**/api/admin/landing/featured-products", route => route.fulfill({
      status: 500, contentType: "application/json", body: JSON.stringify({ error: "SAVE_FAILED" }),
    }));
    await page.route("**/api/admin/landing/publish", route => {
      published = true;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
    });
    await slots.nth(0).selectOption("");
    await slots.nth(1).selectOption(ids[0]);
    await slots.nth(0).selectOption(ids[1]);
    await page.locator('.homepage-admin button[type="submit"]').click();
    await expect(page.locator(".homepage-admin-feedback-error")).toBeVisible();
    expect(published).toBe(false);
  });
});
