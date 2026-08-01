# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> upload regression check
- Location: e2e/admin-flow.spec.ts:254:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#p-name')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('#p-name')

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "MONADATY — Home":
    - /url: /
    - text: MONADATY
  - link "MONADATY — Home":
    - /url: /
    - text: MONADATY
  - navigation "Primary":
    - list:
      - listitem:
        - link "home":
          - /url: /
      - listitem:
        - link "shop":
          - /url: /shop
      - listitem:
        - button "collections"
      - listitem:
        - link "about":
          - /url: /about
  - button "select_language":
    - text: 🇫🇷FR
    - img
  - button "open_search"
  - link "Admin":
    - /url: /admin/login
  - link "Wishlist":
    - /url: /wishlist
  - button "Open drink box"
  - text: search_drinks
  - searchbox "search_drinks"
  - button "toggle_menu"
- main:
  - text: OFFLINE
  - heading "no_connection" [level=1]
  - paragraph: check_connection
  - link "go_home":
    - /url: /
- contentinfo:
  - link "MONADATY — Home":
    - /url: /
    - text: MONADATY
  - paragraph: Crafted in Casablanca. Premium Moroccan refreshment, built around taste.
  - link "Instagram":
    - /url: https://instagram.com/monadaty
  - navigation "Shop":
    - paragraph: SHOP
    - list:
      - listitem:
        - link "All Drinks":
          - /url: /shop
      - listitem:
        - link "Collections":
          - /url: /collections
      - listitem:
        - link "Best Sellers":
          - /url: /shop
  - navigation "Discover":
    - paragraph: DISCOVER
    - list:
      - listitem:
        - link "Our Story":
          - /url: /about
      - listitem:
        - link "Journal":
          - /url: "#"
      - listitem:
        - link "Contact":
          - /url: mailto:hello@monadaty.com
  - navigation "Help":
    - paragraph: HELP
    - list:
      - listitem:
        - link "FAQ":
          - /url: "#"
      - listitem:
        - link "Shipping":
          - /url: "#"
      - listitem:
        - link "Returns":
          - /url: "#"
  - paragraph: © 2025 MONADATY. All rights reserved.
  - navigation:
    - link "Privacy":
      - /url: "#"
    - link "Terms":
      - /url: "#"
  - text: Casablanca · Morocco
  - button "select_language":
    - text: 🇫🇷FR
    - img
- region "Notifications alt+T"
```

# Test source

```ts
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
  194 |     const excessiveRepeats = analysis.repeated.filter((r) => {
  195 |       const match = r.match(/\((\d+)x\)/);
  196 |       return match && parseInt(match[1]) > 20;
  197 |     });
  198 |     expect(excessiveRepeats.length).toBe(0);
  199 | 
  200 |     const loadingEls = await page.locator('[class*="animate-spin"]').count();
  201 |     expect(loadingEls).toBeLessThan(3);
  202 | 
  203 |     console.log("✅ All network checks passed!");
  204 |   });
  205 | });
  206 | 
  207 | // Separate test: verify login form works
  208 | test("login form works", async ({ page }) => {
  209 |   await login(page);
  210 |   console.log("✅ Login form test passed");
  211 | });
  212 | 
  213 | // Test: delete product from admin/shop via API route
  214 | test("delete product via API route", async ({ page }) => {
  215 |   await login(page);
  216 | 
  217 |   // Create a product first to ensure we have something to delete
  218 |   const createResult = await page.evaluate(async () => {
  219 |     const res = await fetch("/api/admin/products", {
  220 |       method: "POST",
  221 |       headers: { "Content-Type": "application/json" },
  222 |       body: JSON.stringify({
  223 |         name: `DELETE-TEST-${Date.now()}`,
  224 |         slug: `delete-test-${Date.now()}`,
  225 |         regularPrice: "9.99",
  226 |         stock: 1,
  227 |         status: "Active",
  228 |       }),
  229 |     });
  230 |     return res.json();
  231 |   });
  232 |   const productId = createResult.product?.id;
  233 |   expect(productId).toBeTruthy();
  234 |   console.log(`Created product for delete test: ${productId}`);
  235 | 
  236 |   // Delete via API
  237 |   const deleteResult = await page.evaluate(async (id: string) => {
  238 |     const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  239 |     return { status: res.status, body: await res.json() };
  240 |   }, productId);
  241 |   expect(deleteResult.status).toBe(200);
  242 |   console.log(`✅ Delete API returned ${deleteResult.status}`);
  243 | 
  244 |   // Verify the product is gone
  245 |   const verifyResult = await page.evaluate(async (id: string) => {
  246 |     const res = await fetch(`/api/admin/products/${id}`);
  247 |     return res.status;
  248 |   }, productId);
  249 |   expect(verifyResult).toBe(404);
  250 |   console.log("✅ Product deleted and verified via API");
  251 | });
  252 | 
  253 | // Test: upload still works (regression check)
  254 | test("upload regression check", async ({ page }) => {
  255 |   await login(page);
  256 | 
  257 |   // Go to product create page
  258 |   await page.goto("/admin/products/add");
  259 |   await page.waitForURL(/\/admin\/products\/add/);
> 260 |   await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });
      |                                         ^ Error: expect(locator).toBeVisible() failed
  261 | 
  262 |   // Upload an image
  263 |   const fileInput = page.locator('input[type="file"]').first();
  264 |   await fileInput.setInputFiles(IMAGE_PATH);
  265 |   await page.waitForTimeout(1000);
  266 | 
  267 |   // Wait for image to appear in the preview grid (upload complete)
  268 |   const uploadedImage = page.locator('img[alt="test-image"]');
  269 |   await expect(uploadedImage).toBeVisible({ timeout: 30000 });
  270 |   // Also verify dimensions text appears, confirming upload metadata
  271 |   await expect(page.locator('text=/×/')).toBeVisible({ timeout: 5000 });
  272 |   console.log("✅ Upload still works after delete fix");
  273 | });
  274 | 
```