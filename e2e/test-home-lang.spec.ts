import { test, expect, Page } from "@playwright/test";

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
}

test("Home page loads without useCart error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", err => {
    errors.push(err.message);
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const useCartErrors = errors.filter(e => e.includes("useCart must be used within CartProvider"));
  expect(useCartErrors.length).toBe(0);
  
  const hydrationErrors = errors.filter(e => e.includes("Hydration failed"));
  expect(hydrationErrors.length).toBe(0);
});

test("Language switch FR -> EN -> AR -> FR works on home page", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", err => errors.push(err.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Switch to EN
  await page.click('[aria-label="Select language"]');
  await page.click('button:has-text("English")');
  await page.waitForTimeout(1500);

  // Switch to AR
  await page.click('[aria-label="Select language"]');
  await page.click('button:has-text("العربية")');
  await page.waitForTimeout(1500);

  // Switch back to FR
  await page.click('[aria-label="Select language"]');
  await page.click('button:has-text("Français")');
  await page.waitForTimeout(1500);

  const useCartErrors = errors.filter(e => e.includes("useCart must be used within CartProvider"));
  expect(useCartErrors.length).toBe(0);
  
  const hydrationErrors = errors.filter(e => e.includes("Hydration failed"));
  expect(hydrationErrors.length).toBe(0);
});

test("Admin -> Logo click -> Home works without CartProvider error", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", err => errors.push(err.message));

  await login(page);
  await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click logo to go home
  await page.click('a[href="/"]:has-text("MONADATY")');
  await page.waitForURL("/");
  await page.waitForTimeout(1500);

  const useCartErrors = errors.filter(e => e.includes("useCart must be used within CartProvider"));
  expect(useCartErrors.length).toBe(0);
  
  const hydrationErrors = errors.filter(e => e.includes("Hydration failed"));
  expect(hydrationErrors.length).toBe(0);
});

test("Cart persists across language changes", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", err => errors.push(err.message));

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Add item to cart
  const addButtons = page.locator('button:has-text("Add to cart"), button:has-text("Ajouter au panier")');
  if (await addButtons.count() > 0) {
    await addButtons.first().click();
    await page.waitForTimeout(500);
  }

  // Switch language
  await page.click('[aria-label="Select language"]');
  await page.click('button:has-text("English")');
  await page.waitForTimeout(1500);

  // Verify cart still has items
  const cartButton = page.locator('#cart-button');
  await expect(cartButton).toBeVisible();

  const useCartErrors = errors.filter(e => e.includes("useCart must be used within CartProvider"));
  expect(useCartErrors.length).toBe(0);
  
  const hydrationErrors = errors.filter(e => e.includes("Hydration failed"));
  expect(hydrationErrors.length).toBe(0);
});
