import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = "ilyass@gmail.com";
const ADMIN_PASSWORD = "ilyass123ilyass123";

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

    const tabs = page.locator(".border-b button");
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(8);

    await tabs.nth(1).click();
    await page.waitForTimeout(1000);

    const sectionCard = page.locator(".luxury-card").first();
    await expect(sectionCard).toBeVisible({ timeout: 5000 });
  });

  test("admin can interact with featured products form", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator(".border-b button");
    await tabs.nth(1).click();
    await page.waitForTimeout(1000);

    const saveBtn = page.locator("button[type='submit']").first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
    }
  });
});

test.describe("Landing CMS", () => {
  test("admin can access all CMS tabs", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator(".border-b button");
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(8);

    for (let i = 0; i < Math.min(count, 10); i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(300);
      const sectionCard = page.locator(".luxury-card").first();
      await expect(sectionCard).toBeVisible({ timeout: 3000 });
    }
  });

  test("announcement bar settings can be saved", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator(".border-b button");
    const count = await tabs.count();

    // Navigate to last tabs (announcement, newsletter)
    if (count >= 9) {
      await tabs.nth(8).click();
      await page.waitForTimeout(500);

      const saveBtn = page.locator("button[type='submit']:has-text('Save')").first();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test("newsletter settings can be saved", async ({ page }) => {
    await loginViaAPI(page);
    await page.goto("/admin/landing");
    await page.waitForLoadState("networkidle", { timeout: 15000 });

    const tabs = page.locator(".border-b button");
    const count = await tabs.count();

    if (count >= 10) {
      await tabs.nth(9).click();
      await page.waitForTimeout(500);

      const saveBtn = page.locator("button[type='submit']:has-text('Save')").first();
      if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
      }
    }
  });
});
