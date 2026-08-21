import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3458";
const ORIGIN = new URL(BASE_URL).origin;

async function loginViaApi(page: Page) {
  const response = await page.request.post(`${ORIGIN}/api/admin/login`, {
    headers: { Origin: ORIGIN },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);
}

test("verified upload uses its final URL immediately and survives navigation", async ({ page }) => {
  test.slow();
  await loginViaApi(page);

  const productName = `E2E-Runtime-${Date.now()}`;
  let productId = "";
  let uploadedURL = "";

  try {
    await page.goto("/admin/products/add", { waitUntil: "networkidle" });
    await expect(page.locator("#p-name")).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    const [spoofedResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/api/admin/products/upload")),
      fileInput.setInputFiles({
        name: "spoofed.png",
        mimeType: "image/png",
        buffer: Buffer.from("not a real png"),
      }),
    ]);
    expect(spoofedResponse.status()).toBe(400);
    await expect(page.locator('[data-upload-status="error"]')).toContainText(
      "File contents do not match the declared type",
      { timeout: 15_000 },
    );

    const validPng = Buffer.concat([
      readFileSync(path.resolve(process.cwd(), "public/icons/icon-192.png")),
      Buffer.from(productName),
    ]);
    const [validResponse] = await Promise.all([
      page.waitForResponse((response) => response.url().endsWith("/api/admin/products/upload")),
      fileInput.setInputFiles({
        name: "runtime-test.png",
        mimeType: "image/png",
        buffer: validPng,
      }),
    ]);
    expect(validResponse.status()).toBe(200);

    await expect(page.locator('[data-upload-status="done"]')).toBeVisible();
    const persistentPreview = page.locator('img[src^="/uploads/products/"]').last();
    await expect(persistentPreview).toBeVisible();
    uploadedURL = (await persistentPreview.getAttribute("src")) || "";
    expect(uploadedURL).toMatch(/^\/uploads\/products\/[a-zA-Z0-9_.-]+$/);
    expect(uploadedURL.startsWith("blob:")).toBe(false);

    await page.fill("#p-name", productName);
    await page.fill("#p-regular", "17.50");
    await page.fill("#p-stock", "9");
    await page.selectOption("#p-status", "Active");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/admin\/products$/);

    const list = await page.evaluate(async () => {
      const response = await fetch("/api/admin/products/list");
      return response.json();
    });
    const product = (list.products || []).find((candidate: { name: string }) => candidate.name === productName);
    expect(product).toBeTruthy();
    productId = product.id;

    await page.goto(`/admin/products/${productId}/edit`, { waitUntil: "load" });
    const imageTab = page.getByRole("button", { name: /images/i });
    if (await imageTab.count()) await imageTab.first().click();
    await expect(page.locator(`img[src="${uploadedURL}"]`).first()).toBeVisible();

    await page.goto("/");
    await page.goto(`/product/${productId}`, { waitUntil: "load" });
    const storefrontImage = page.locator(`img[alt="${productName}"]`).first();
    await expect(storefrontImage).toBeVisible();
    await expect.poll(() => storefrontImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);

    const storedFile = await page.request.get(`${ORIGIN}${uploadedURL}`);
    expect(storedFile.status()).toBe(200);
    expect((await storedFile.body()).byteLength).toBe(validPng.byteLength);
  } finally {
    if (productId) {
      const deleted = await page.request.delete(`${ORIGIN}/api/admin/products/${productId}`, {
        headers: { Origin: ORIGIN },
      });
      expect(deleted.status()).toBe(200);
      if (uploadedURL) {
        await expect.poll(async () => (await page.request.get(`${ORIGIN}${uploadedURL}`)).status()).toBe(404);
      }
    }
  }
});
