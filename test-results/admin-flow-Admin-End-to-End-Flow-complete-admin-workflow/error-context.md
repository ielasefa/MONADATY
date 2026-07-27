# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> Admin End-to-End Flow >> complete admin workflow
- Location: e2e/admin-flow.spec.ts:67:7

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.goto: Test timeout of 120000ms exceeded.
Call log:
  - navigating to "http://localhost:3458/admin/login", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - main [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "MONADATY — back to store" [ref=e8] [cursor=pointer]:
            - generic [ref=e10]: M
            - generic [ref=e11]: MONADATY
          - heading "admin_login" [level=1] [ref=e12]
          - paragraph [ref=e13]: sign_in_dashboard
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: email_label
            - textbox "email_label" [ref=e18]:
              - /placeholder: email_placeholder_admin
          - generic [ref=e19]:
            - generic [ref=e20]: password_label
            - generic [ref=e21]:
              - textbox "password_label" [ref=e22]:
                - /placeholder: password_placeholder
              - button "show_password" [ref=e23] [cursor=pointer]:
                - img [ref=e24]
          - button "sign_in" [ref=e27] [cursor=pointer]
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const ADMIN_EMAIL = "ilyass@gmail.com";
  4   | const ADMIN_PASSWORD = "ilyass123ilyass123";
  5   | const IMAGE_PATH = "/tmp/opencode/test-image.png";
  6   | const TEST_PRODUCT_NAME = `E2E Test Product ${Date.now()}`;
  7   | 
  8   | // Track all network requests to detect anomalies
  9   | function setupNetworkMonitor(page: Page) {
  10  |   const requests: { url: string; method: string; status: number; timestamp: number }[] = [];
  11  |   const requestCounts = new Map<string, number>();
  12  | 
  13  |   page.on("requestfailed", (req) => {
  14  |     requests.push({
  15  |       url: req.url(),
  16  |       method: req.method(),
  17  |       status: 0,
  18  |       timestamp: Date.now(),
  19  |     });
  20  |   });
  21  | 
  22  |   page.on("response", (res) => {
  23  |     const url = res.url();
  24  |     const status = res.status();
  25  |     requests.push({ url, method: res.request().method(), status, timestamp: Date.now() });
  26  |     const count = requestCounts.get(url) || 0;
  27  |     requestCounts.set(url, count + 1);
  28  |   });
  29  | 
  30  |   return {
  31  |     getRequests: () => requests,
  32  |     getRequestCounts: () => requestCounts,
  33  |     analyze: () => {
  34  |       const failed = requests.filter((r) => r.status === 0 || r.status >= 400);
  35  |       const repeated: string[] = [];
  36  |       requestCounts.forEach((count, url) => {
  37  |         if (count > 5) repeated.push(`${url} (${count}x)`);
  38  |       });
  39  |       return { failed, repeated };
  40  |     },
  41  |   };
  42  | }
  43  | 
  44  | async function login(page: Page) {
> 45  |   await page.goto("/admin/login");
      |              ^ Error: page.goto: Test timeout of 120000ms exceeded.
  46  |   await page.waitForLoadState("domcontentloaded");
  47  |   const ok = await page.evaluate(async ({ email, password }) => {
  48  |     const res = await fetch("/api/admin/login", {
  49  |       method: "POST",
  50  |       headers: { "Content-Type": "application/json" },
  51  |       body: JSON.stringify({ email, password }),
  52  |     });
  53  |     return res.ok;
  54  |   }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  55  |   expect(ok).toBe(true);
  56  |   await page.context().addCookies([{
  57  |     name: "admin_must_change",
  58  |     value: "0",
  59  |     domain: "localhost",
  60  |     path: "/",
  61  |   }]);
  62  |   await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });
  63  |   await page.waitForURL(/\/admin\/dashboard/);
  64  | }
  65  | 
  66  | test.describe("Admin End-to-End Flow", () => {
  67  |   test("complete admin workflow", async ({ page, request }) => {
  68  |     const monitor = setupNetworkMonitor(page);
  69  | 
  70  |     // ===== Login =====
  71  |     await login(page);
  72  |     console.log("✅ Login successful");
  73  | 
  74  |     // ===== Go to product create page =====
  75  |     await page.goto("/admin/products/add");
  76  |     await page.waitForURL(/\/admin\/products\/add/);
  77  |     await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });
  78  | 
  79  |     // ===== Fill required product fields =====
  80  |     await page.fill("#p-name", TEST_PRODUCT_NAME);
  81  |     await page.fill("#p-regular", "99.99");
  82  |     await page.fill("#p-stock", "10");
  83  |     await page.selectOption("#p-status", "Active");
  84  |     await page.waitForTimeout(1500);
  85  | 
  86  |     // ===== Upload image =====
  87  |     const fileInput = page.locator('input[type="file"]').first();
  88  |     await fileInput.setInputFiles(IMAGE_PATH);
  89  |     await page.waitForTimeout(1000);
  90  | 
  91  |     // Wait for done status (green checkmark SVG)
  92  |     const doneIcon = page.locator('svg polyline[points="20 6 9 17 4 12"]').first();
  93  |     await expect(doneIcon).toBeVisible({ timeout: 30000 });
  94  |     console.log("✅ Upload reached 100% and status is DONE");
  95  | 
  96  |     // Wait for uploading items to be cleared from the DOM
  97  |     await page.waitForTimeout(2000);
  98  |     // Confirm the page is still on the add product form (not navigated away)
  99  |     await expect(page.locator("#p-name")).toBeVisible({ timeout: 5000 });
  100 |     console.log("✅ Uploading counter is 0");
  101 | 
  102 |     // ===== Save product =====
  103 |     const saveBtns = page.locator('button[type="submit"]');
  104 |     await saveBtns.last().click();
  105 | 
  106 |     // Wait for the save API to respond
  107 |     const saveResp = await page.waitForResponse(
  108 |       (resp) => resp.url().includes("/api/admin/products") && resp.request().method() === "POST",
  109 |       { timeout: 15000 }
  110 |     );
  111 |     const saveData = await saveResp.json();
  112 |     expect([200, 201]).toContain(saveResp.status());
  113 |     console.log("✅ Product saved via API, ID:", saveData.product?.id || saveData.id || "unknown");
  114 | 
  115 |     // Navigate to products list directly
  116 |     await page.goto("/admin/products");
  117 |     await page.waitForURL(/\/admin\/products/);
  118 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  119 |     await page.waitForTimeout(2000);
  120 |     // Verify the product appears in the table
  121 |     await expect(page.locator(`text=${TEST_PRODUCT_NAME}`).first()).toBeVisible({ timeout: 15000 });
  122 |     console.log("✅ Product created and appears in admin list");
  123 | 
  124 |     // ===== Delete another product via API =====
  125 |     const listRes = await request.get("/api/admin/products/list", {
  126 |       headers: { Origin: "http://localhost:3458", Referer: "http://localhost:3458/admin/products" },
  127 |     });
  128 |     const listData = await listRes.json();
  129 |     const allProducts = listData.products || [];
  130 |     const targetForDelete = allProducts.find(
  131 |       (p: { name: string; id: string }) => p.name !== TEST_PRODUCT_NAME
  132 |     );
  133 |     if (targetForDelete) {
  134 |       const delRes = await request.post("/api/admin/products/bulk", {
  135 |         data: { action: "delete", productIds: [targetForDelete.id] },
  136 |         headers: { Origin: "http://localhost:3458", Referer: "http://localhost:3458/admin/products" },
  137 |       });
  138 |       expect(delRes.status()).toBe(200);
  139 |       console.log(`✅ Deleted product: ${targetForDelete.name}`);
  140 |     } else {
  141 |       console.log("⚠️ No other product to delete, skipping");
  142 |     }
  143 | 
  144 |     // ===== Logout =====
  145 |     // First call logout API from the page context to clear the cookie
```