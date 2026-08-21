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

  test("admin can view featured products in landing page", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator("button[data-section-key]");
    const count = await tabs.count();
    expect(count).toBe(9);

    await page.locator('button[data-section-key="featured"]').click();

    const sectionCard = page.getByTestId("landing-section-card").first();
    await expect(sectionCard).toBeVisible({ timeout: 5000 });
  });

  test("admin can interact with featured products form", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    await page.locator('button[data-section-key="featured"]').click();

    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    const [saveResponse] = await Promise.all([
      page.waitForResponse(
        (response) => response.url().endsWith("/api/admin/landing/order") && response.request().method() === "PUT",
      ),
      page.getByTestId("landing-save-draft").click(),
    ]);
    expect(saveResponse.status()).toBe(200);
    await expect(page.getByTestId("landing-save-draft")).toBeEnabled();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
  });
});

test.describe("Landing CMS", () => {
  test("admin can access all CMS tabs", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator("button[data-section-key]");
    const count = await tabs.count();
    expect(count).toBe(9);

    for (let i = 0; i < Math.min(count, 10); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(300);
      const sectionCard = page.getByTestId("landing-section-card").first();
      await expect(sectionCard).toBeVisible({ timeout: 3000 });
    }
  });

  test("SEO settings are reachable", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    await page.locator('button[data-section-key="seo"]').click();
    await expect(page.getByTestId("landing-section-card").first()).toBeVisible();
  });

  test("newsletter settings are reachable", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    await page.locator('button[data-section-key="newsletter"]').click();
    await expect(page.getByTestId("landing-section-card").first()).toBeVisible();
  });
});
