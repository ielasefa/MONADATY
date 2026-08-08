import { test, expect, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 800 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1440, height: 1000 },
  { name: "xl", width: 1920, height: 1000 },
];

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

async function login(page: Page) {
  await page.context().clearCookies();
  const loginRes = await page.request.post("/api/admin/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    headers: { Origin: "http://localhost:3458" },
  });
  expect(loginRes.status()).toBe(200);
  await page.context().addCookies([{
    name: "admin_must_change",
    value: "0",
    domain: "localhost",
    path: "/",
  }]);
  await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/\/admin\/dashboard/);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
}

test.describe("Admin Dashboard - Visual Regression", () => {
  for (const vp of VIEWPORTS) {
    test(`renders correctly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await login(page);

      // Wait for all animations to settle
      await page.waitForTimeout(1500);

      // Check for horizontal overflow
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 1);

      // Screenshot
      await expect(page).toHaveScreenshot(`dashboard-${vp.name}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixels: 500,
      });
    });
  }
});

test.describe("Admin Dashboard - RTL", () => {
  test("renders correctly in RTL", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await login(page);

    // Set RTL
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    });

    await page.waitForTimeout(1000);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(1441);

    await expect(page).toHaveScreenshot("dashboard-rtl.png", {
      fullPage: true,
      animations: "disabled",
      maxDiffPixels: 500,
    });
  });
});