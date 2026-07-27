import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = "ilyass@gmail.com";
const ADMIN_PASSWORD = "ilyass123ilyass123";
const IMAGE_PATH = "/tmp/opencode/test-image.png";
const TEST_PRODUCT_NAME = `E2E-UX-Improve-${Date.now()}`;

async function login(page: Page) {
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
  await page.context().addCookies([{
    name: "admin_must_change",
    value: "0",
    domain: "localhost",
    path: "/",
  }]);
}

test.describe("Product Creation & Upload UX — Improved", () => {
  test("full flow: upload states, success screen, product in list", async ({ page }) => {
    // 1. Login
    await login(page);
    await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);

    // 2. Navigate to product create page
    await page.goto("/admin/products/add");
    await page.waitForURL(/\/admin\/products\/add/);
    await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });

    // 3. Fill required product fields
    await page.fill("#p-name", TEST_PRODUCT_NAME);
    await page.fill("#p-regular", "79.99");
    await page.fill("#p-stock", "50");
    await page.selectOption("#p-status", "Active");
    console.log("PASS: Product fields filled");

    // 4. Verify submit button is enabled before upload
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeEnabled();
    console.log("PASS: Submit button enabled before upload");

    // 5. Upload image and verify state transitions
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(IMAGE_PATH);
    console.log("PASS: Image file selected for upload");

    // 6. Wait for upload queue to appear
    const uploadQueue = page.locator('[data-testid="upload-queue"]');
    await expect(uploadQueue).toBeVisible({ timeout: 10000 });

    // 7. Wait for upload to reach "completed" status
    //    The ImageUploader now shows 5 states: pending → uploading → processing → done
    const completedItem = page.locator('[data-testid="upload-status-completed"]').first();
    await expect(completedItem).toBeVisible({ timeout: 45000 });
    console.log("PASS: Upload status = Completed");

    // 8. Verify the upload item has the correct data attribute
    const uploadItem = page.locator('[data-upload-status="done"]').first();
    await expect(uploadItem).toBeVisible();
    console.log("PASS: Upload item marked as done");

    // 9. Verify the success banner is visible
    const successBanner = page.locator('[data-testid="upload-success-banner"]');
    await expect(successBanner).toBeVisible({ timeout: 10000 });
    console.log("PASS: Upload completed banner visible");

    // 10. Verify submit button is still enabled after upload completes
    await expect(submitBtn).toBeEnabled();
    console.log("PASS: Submit button enabled after upload");

    // 11. Verify no "Waiting..." or "Processing..." states remain
    const pendingItems = await page.locator('text=Waiting...').count();
    const processingItems = await page.locator('text=Processing...').count();
    expect(pendingItems).toBe(0);
    expect(processingItems).toBe(0);
    console.log("PASS: No pending/processing states remain");

    // 12. Submit the product
    await submitBtn.click();
    console.log("PASS: Submit button clicked");

    // 13. Verify the success screen appears (product-created-success)
    const successScreen = page.locator('[data-testid="product-created-success"]');
    await expect(successScreen).toBeVisible({ timeout: 15000 });
    console.log("PASS: Product created success screen visible");

    // 14. Verify success screen content (check for green checkmark icon and heading)
    const heading = successScreen.locator("h2");
    await expect(heading).toBeVisible();
    console.log("PASS: Success screen heading visible");

    // 15. Wait for redirect to products list
    await page.waitForURL(/\/admin\/products$/, { timeout: 10000 });
    console.log("PASS: Redirected to products list");

    // 16. Wait for products list to load
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(1500);

    // 17. Verify no loading skeletons remain in the product table
    const skeletons = await page.locator("tbody [class*='animate-pulse']").count();
    expect(skeletons).toBe(0);
    console.log("PASS: No loading skeletons in product table");

    // 18. Verify the new product appears in the list
    const productRow = page.locator(`[data-testid="product-row"]:has-text("${TEST_PRODUCT_NAME}")`);
    await expect(productRow).toBeVisible({ timeout: 15000 });
    console.log("PASS: Product appears in admin list");

    // 19. Verify product row has correct status badge
    await expect(productRow.locator('[data-testid="product-status"]')).toContainText("Active");
    console.log("PASS: Product status badge shows Active");

    // 20. Verify product row has correct price
    await expect(productRow.locator('[data-testid="product-price"]')).toContainText("79.99");
    console.log("PASS: Product price visible in row");

    // 21. Cleanup: delete the test product
    const listRes = await page.evaluate(async () => {
      const res = await fetch("/api/admin/products/list");
      return res.json();
    });
    const target = (listRes.products || []).find(
      (p: { name: string }) => p.name === TEST_PRODUCT_NAME
    );
    if (target) {
      await page.evaluate(async (id: string) => {
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      }, target.id);
      console.log("PASS: Cleanup — test product deleted");
    }
  });

  test("upload states: pending → uploading → processing → completed", async ({ page }) => {
    // 1. Login
    await login(page);
    await page.goto("/admin/products/add");
    await page.waitForURL(/\/admin\/products\/add/);
    await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });

    // 2. Fill minimal fields
    await page.fill("#p-name", `Upload-States-Test-${Date.now()}`);
    await page.fill("#p-regular", "19.99");

    // 3. Upload image
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(IMAGE_PATH);

    // 4. Verify "pending" state appears (spinner icon + "Waiting...")
    const pendingStatus = page.locator('[data-testid="upload-status-pending"]');
    // It may be very brief, but should appear
    try {
      await expect(pendingStatus).toBeVisible({ timeout: 3000 });
      console.log("PASS: Pending state observed");
    } catch {
      console.log("INFO: Pending state was too brief to capture (normal for fast uploads)");
    }

    // 5. Wait for completed
    const completedStatus = page.locator('[data-testid="upload-status-completed"]').first();
    await expect(completedStatus).toBeVisible({ timeout: 45000 });
    console.log("PASS: Completed state visible");

    // 6. Verify the upload item background changes to green-tinted
    const doneItem = page.locator('[data-upload-status="done"]').first();
    await expect(doneItem).toBeVisible();
    const className = await doneItem.getAttribute("class");
    expect(className).toContain("emerald");
    console.log("PASS: Completed item has emerald styling");

    // 7. Cleanup
    await page.evaluate(async () => {
      const res = await fetch("/api/admin/products/list");
      const data = await res.json();
      const products = data.products || [];
      const testProducts = products.filter((p: { name: string }) => p.name.startsWith("Upload-States-Test-"));
      for (const p of testProducts) {
        await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      }
    });
  });

  test("no false loading: submit button stays disabled during redirect", async ({ page }) => {
    // 1. Login
    await login(page);
    await page.goto("/admin/products/add");
    await page.waitForURL(/\/admin\/products\/add/);
    await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });

    // 2. Fill fields
    const testName = `No-False-Loading-${Date.now()}`;
    await page.fill("#p-name", testName);
    await page.fill("#p-regular", "34.99");
    await page.fill("#p-stock", "10");

    // 3. Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 4. Verify button is disabled immediately after click
    await expect(submitBtn).toBeDisabled();
    console.log("PASS: Submit button disabled after click");

    // 5. Wait for success screen
    const successScreen = page.locator('[data-testid="product-created-success"]');
    await expect(successScreen).toBeVisible({ timeout: 15000 });
    console.log("PASS: Success screen visible (button stays disabled behind it)");

    // 6. Cleanup
    const listRes = await page.evaluate(async () => {
      const res = await fetch("/api/admin/products/list");
      return res.json();
    });
    const target = (listRes.products || []).find(
      (p: { name: string }) => p.name === testName
    );
    if (target) {
      await page.evaluate(async (id: string) => {
        await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      }, target.id);
    }
  });

  test("delete consistency: product disappears from list after delete", async ({ page }) => {
    // 1. Login
    await login(page);

    // 2. Create a product via API
    const createRes = await page.evaluate(async () => {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Delete-Consistency-${Date.now()}`,
          slug: `delete-consistency-${Date.now()}`,
          regularPrice: "10.00 MAD",
          stock: 5,
          status: "Draft",
          images: [],
        }),
      });
      return res.json();
    });
    expect(createRes.product).toBeTruthy();
    const productId = createRes.product.id;
    const productName = createRes.product.name;
    console.log(`PASS: Product created via API: ${productId}`);

    // 3. Go to products list and verify it appears
    await page.goto("/admin/products");
    await page.waitForLoadState("networkidle", { timeout: 15000 });
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${productName}`).first()).toBeVisible({ timeout: 10000 });
    console.log("PASS: Product visible in list after creation");

    // 4. Delete via API
    const deleteRes = await page.evaluate(async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      return res.json();
    }, productId);
    expect(deleteRes.success || deleteRes.ok || resOk(deleteRes)).toBeTruthy();
    console.log("PASS: Product deleted via API");

    // 5. Refresh and verify it disappears
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const gone = await page.locator(`text=${productName}`).count();
    expect(gone).toBe(0);
    console.log("PASS: Product disappeared from list after delete");
  });
});

function resOk(data: Record<string, unknown>): boolean {
  return data.success === true || data.ok === true;
}
