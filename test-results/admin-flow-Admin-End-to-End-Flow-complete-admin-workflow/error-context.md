# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> Admin End-to-End Flow >> complete admin workflow
- Location: e2e/admin-flow.spec.ts:67:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('svg polyline[points="20 6 9 17 4 12"]').first()
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for locator('svg polyline[points="20 6 9 17 4 12"]').first()

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- main:
  - main:
    - heading "Add Product" [level=1]
    - paragraph: Créer un nouveau produit dans votre catalogue
    - button "Annuler"
    - button "Enregistrer le produit"
    - heading "Informations de base" [level=2]
    - text: Product Name *
    - textbox "Product Name *":
      - /placeholder: "ex: Soda Citron Pétillant"
      - text: E2E Test Product 1785620032818
    - text: Slug
    - textbox "Slug":
      - /placeholder: soda-citron-petillant
      - text: e2e-test-product-1785620032818
    - img
    - text: Short Description
    - textbox "Short Description":
      - /placeholder: Une brève description pour les fiches produit
    - text: Full Description
    - textbox "Full Description":
      - /placeholder: Description détaillée du produit
    - text: SKU
    - textbox "SKU":
      - /placeholder: Généré automatiquement
      - text: E2E-TEST-PRODUCT-MHI4KF
    - text: Barcode
    - textbox "Barcode":
      - /placeholder: optional
    - heading "pricing" [level=2]
    - text: Regular Price *
    - textbox "Regular Price *":
      - /placeholder: "0.00"
      - text: "99.99"
    - text: MAD sale_price
    - textbox "sale_price":
      - /placeholder: "0.00"
    - text: MAD Prix de revient
    - textbox "Prix de revient":
      - /placeholder: "0.00"
    - text: MAD currency
    - combobox "currency":
      - option "MAD" [selected]
      - option "EUR"
      - option "USD"
    - paragraph: profit
    - paragraph: 99.99 MAD
    - paragraph: margin
    - paragraph: 100.0%
    - heading "Stock" [level=2]
    - text: Quantité en stock
    - spinbutton "Quantité en stock": "10"
    - text: Seuil de stock faible
    - spinbutton "Seuil de stock faible": "5"
    - text: En stock
    - heading "Organisation" [level=2]
    - text: category
    - combobox "category":
      - option "Aucune catégorie" [selected]
    - button "create_category": + Nouveau
    - text: collection
    - combobox "collection":
      - option "Aucune collection" [selected]
    - text: brand
    - textbox "brand":
      - /placeholder: "ex: MONADATY"
    - heading "Statut et indicateurs" [level=2]
    - text: status
    - combobox "status":
      - option "Brouillon"
      - option "active" [selected]
      - option "hidden"
      - option "archived"
    - checkbox "featured"
    - text: featured
    - checkbox "best_seller"
    - text: best_seller
    - heading "images" [level=2]
    - img
    - paragraph: Glissez-déposez les images ici
    - paragraph: JPG, PNG, WebP, AVIF — Up to 10 MB each — Max 10 images
    - button "Browse Files":
      - img
      - text: Browse Files
    - button "Camera":
      - img
      - text: Camera
    - img "test-image.png"
    - paragraph: test-image.png
    - paragraph: 0.0 MB
    - paragraph: "Upload failed: 401"
    - button "Réessayer le téléversement"
    - button "Annuler"
    - button "Enregistrer le produit"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | 
  3   | const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
  4   | const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
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
  45  |   await page.goto("/admin/login");
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
> 93  |     await expect(doneIcon).toBeVisible({ timeout: 30000 });
      |                            ^ Error: expect(locator).toBeVisible() failed
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
  146 |     await page.evaluate(async () => {
  147 |       await fetch("/api/admin/logout", { method: "POST" });
  148 |     });
  149 |     // Now navigate to login - the layout should see no auth and show the login form
  150 |     await page.goto("/admin/login");
  151 |     await page.waitForURL(/\/admin\/login/);
  152 |     await expect(page.locator("#login-email")).toBeVisible({ timeout: 10000 });
  153 |     console.log("✅ Logout page loaded");
  154 | 
  155 |     // ===== Login again via API =====
  156 |     const ok2 = await page.evaluate(async ({ email, password }) => {
  157 |       const res = await fetch("/api/admin/login", {
  158 |         method: "POST",
  159 |         headers: { "Content-Type": "application/json" },
  160 |         body: JSON.stringify({ email, password }),
  161 |       });
  162 |       return res.ok;
  163 |     }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  164 |     expect(ok2).toBe(true);
  165 | 
  166 |     await page.goto("/admin/dashboard");
  167 |     await page.waitForURL(/\/admin\/dashboard/);
  168 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  169 |     console.log("✅ Re-login successful");
  170 | 
  171 |     // ===== Navigate to shop =====
  172 |     await page.goto("/shop");
  173 |     await page.waitForURL(/\/shop/);
  174 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  175 |     console.log("✅ Shop page loaded");
  176 | 
  177 |     // ===== Network monitoring =====
  178 |     console.log("Monitoring network for 30 seconds...");
  179 |     await page.waitForTimeout(30000);
  180 | 
  181 |     const analysis = monitor.analyze();
  182 |     const requests = monitor.getRequests();
  183 |     const requestCounts = monitor.getRequestCounts();
  184 | 
  185 |     console.log(`\n=== Network Report ===`);
  186 |     console.log(`Total requests: ${requests.length}`);
  187 |     console.log(`Failed requests: ${analysis.failed.length}`);
  188 |     analysis.failed.forEach((r) =>
  189 |       console.log(`  FAILED: ${r.method} ${r.url} -> ${r.status}`)
  190 |     );
  191 |     console.log(`\nRepeated requests (>5x): ${analysis.repeated.length}`);
  192 |     analysis.repeated.forEach((r) => console.log(`  REPEATED: ${r}`));
  193 | 
```