# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> delete product via API route
- Location: e2e/admin-flow.spec.ts:214:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 404
Received: 401
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e4]:
      - complementary [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e8]: M
          - generic [ref=e9]:
            - generic [ref=e10]: MONADATY
            - generic [ref=e11]: Admin
        - navigation "Navigation admin" [ref=e12]:
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: /admin/dashboard
            - generic [ref=e14]: ◇
            - text: Dashboard
          - link "Orders" [ref=e16] [cursor=pointer]:
            - /url: /admin/orders
            - generic [ref=e17]: ☰
            - text: Orders
          - link "Customers" [ref=e18] [cursor=pointer]:
            - /url: /admin/customers
            - generic [ref=e19]: ♢
            - text: Customers
          - link "Reports" [ref=e20] [cursor=pointer]:
            - /url: /admin/reports
            - generic [ref=e21]: ◎
            - text: Reports
          - link "Automation" [ref=e22] [cursor=pointer]:
            - /url: /admin/automation
            - generic [ref=e23]: ⚡
            - text: Automation
          - link "Security" [ref=e24] [cursor=pointer]:
            - /url: /admin/security
            - generic [ref=e25]: 🔒
            - text: Security
          - link "Landing Page" [ref=e26] [cursor=pointer]:
            - /url: /admin/landing
            - generic [ref=e27]: ◎
            - text: Landing Page
          - link "Shop" [ref=e28] [cursor=pointer]:
            - /url: /admin/shop
            - generic [ref=e29]: □
            - text: Shop
          - link "Categories" [ref=e30] [cursor=pointer]:
            - /url: /admin/categories
            - generic [ref=e31]: ⊞
            - text: Categories
          - link "Collections" [ref=e32] [cursor=pointer]:
            - /url: /admin/collections
            - generic [ref=e33]: ⊟
            - text: Collections
          - link "Blog" [ref=e34] [cursor=pointer]:
            - /url: /admin/blog
            - generic [ref=e35]: △
            - text: Blog
          - link "Inventory" [ref=e36] [cursor=pointer]:
            - /url: /admin/inventory
            - generic [ref=e37]: ▤
            - text: Inventory
          - link "Admins" [ref=e38] [cursor=pointer]:
            - /url: /admin/admins
            - generic [ref=e39]: ✦
            - text: Admins
          - link "Settings" [ref=e40] [cursor=pointer]:
            - /url: /admin/settings
            - generic [ref=e41]: ⚙
            - text: Settings
        - button "Déconnexion" [ref=e43] [cursor=pointer]:
          - generic [ref=e44]: ⏻
          - text: Déconnexion
      - main [ref=e45]:
        - button "Notifications" [ref=e49] [cursor=pointer]:
          - img [ref=e50]
        - generic [ref=e55]:
          - generic [ref=e56]:
            - generic [ref=e57]:
              - heading "Tableau de bord" [level=1] [ref=e58]
              - paragraph [ref=e59]: Aperçu de votre boutique
            - button "Actualiser les données" [ref=e60] [cursor=pointer]: Actualiser
          - generic [ref=e61]:
            - paragraph [ref=e62]: Indicateurs clés
            - generic [ref=e63]:
              - generic [ref=e66]:
                - generic [ref=e67]:
                  - generic [ref=e68]: 💰
                  - generic [ref=e69]:
                    - img [ref=e70]
                    - text: "0"
                - paragraph [ref=e72]: revenue_today
                - paragraph [ref=e73]: 0 DH
              - generic [ref=e77]:
                - generic [ref=e78]:
                  - generic [ref=e79]: 📈
                  - generic [ref=e80]:
                    - img [ref=e81]
                    - text: "0"
                - paragraph [ref=e83]: revenue_this_month
                - paragraph [ref=e84]: 0 DH
              - generic [ref=e88]:
                - generic [ref=e89]:
                  - generic [ref=e90]: 📦
                  - generic [ref=e91]:
                    - img [ref=e92]
                    - text: "0"
                - paragraph [ref=e94]: orders_today
                - paragraph [ref=e95]: "0"
              - generic [ref=e99]:
                - generic [ref=e100]:
                  - generic [ref=e101]: 📋
                  - generic [ref=e102]:
                    - img [ref=e103]
                    - text: "0"
                - paragraph [ref=e105]: orders_this_month
                - paragraph [ref=e106]: "0"
              - generic [ref=e110]:
                - generic [ref=e111]:
                  - generic [ref=e112]: 👥
                  - generic [ref=e113]:
                    - img [ref=e114]
                    - text: 2 new
                - paragraph [ref=e116]: total_customers
                - paragraph [ref=e117]: "2"
              - generic [ref=e121]:
                - generic [ref=e122]:
                  - generic [ref=e123]: 👋
                  - generic [ref=e124]:
                    - img [ref=e125]
                    - text: +
                - paragraph [ref=e127]: new_customers_30d
                - paragraph [ref=e128]: "2"
              - generic [ref=e132]:
                - generic [ref=e134]: 🔄
                - paragraph [ref=e135]: conversion_rate
                - paragraph [ref=e136]: —
              - generic [ref=e140]:
                - generic [ref=e142]: 🏆
                - paragraph [ref=e143]: best_selling
                - paragraph [ref=e144]: "5"
              - generic [ref=e148]:
                - generic [ref=e150]: 📁
                - paragraph [ref=e151]: best_collection
                - paragraph [ref=e152]: —
              - generic [ref=e156]:
                - generic [ref=e158]: 📊
                - paragraph [ref=e159]: avg_order_value
                - paragraph [ref=e160]: 0 DH
          - generic [ref=e163]:
            - paragraph [ref=e165]: Analytics
            - generic [ref=e166]:
              - generic [ref=e167]:
                - paragraph [ref=e168]: Revenue (30 days)
                - paragraph [ref=e170]: No data yet
              - generic [ref=e171]:
                - paragraph [ref=e172]: Orders (30 days)
                - application [ref=e176]:
                  - generic [ref=e188]:
                    - generic [ref=e191]: 07-30
                    - generic [ref=e192]:
                      - generic [ref=e194]: "0"
                      - generic [ref=e196]: "1"
                      - generic [ref=e198]: "2"
                      - generic [ref=e200]: "3"
                      - generic [ref=e202]: "4"
            - generic [ref=e203]:
              - generic [ref=e204]:
                - paragraph [ref=e205]: Top Products
                - application [ref=e209]:
                  - generic [ref=e233]:
                    - generic [ref=e234]:
                      - generic [ref=e236]: "0"
                      - generic [ref=e238]: "0.5"
                      - generic [ref=e240]: "1"
                      - generic [ref=e242]: "1.5"
                      - generic [ref=e244]: "2"
                    - generic [ref=e245]:
                      - generic [ref=e247]: AIN SAISS5L
                      - generic [ref=e249]: POMS 1L
                      - generic [ref=e251]: BAHIA 5L
                      - generic [ref=e253]: POMSMAXI 45CL
                      - generic [ref=e255]: AIN SAISS1.5L
              - generic [ref=e256]:
                - paragraph [ref=e257]: Sales by Collection
                - paragraph [ref=e259]: No data yet
              - generic [ref=e260]:
                - paragraph [ref=e261]: Monthly Revenue
                - application [ref=e265]:
                  - generic [ref=e270]:
                    - generic [ref=e271]:
                      - generic [ref=e273]: Mar
                      - generic [ref=e275]: Apr
                      - generic [ref=e277]: May
                      - generic [ref=e279]: Jun
                      - generic [ref=e281]: Jul
                      - generic [ref=e283]: Aug
                    - generic [ref=e284]:
                      - generic [ref=e286]: 0k
                      - generic [ref=e288]: 0k
                      - generic [ref=e290]: 0k
                      - generic [ref=e292]: 0k
                      - generic [ref=e294]: 0k
          - generic [ref=e296]:
            - paragraph [ref=e297]: Actions rapides
            - generic [ref=e298]:
              - link "➕ Ajouter un produit Créer un nouveau produit" [ref=e299] [cursor=pointer]:
                - /url: /admin/shop
                - generic [ref=e301]:
                  - generic [ref=e302]: ➕
                  - paragraph [ref=e303]: Ajouter un produit
                  - paragraph [ref=e304]: Créer un nouveau produit
              - link "📦 Gestion des commandes Voir toutes les commandes" [ref=e305] [cursor=pointer]:
                - /url: /admin/orders
                - generic [ref=e307]:
                  - generic [ref=e308]: 📦
                  - paragraph [ref=e309]: Gestion des commandes
                  - paragraph [ref=e310]: Voir toutes les commandes
              - link "👥 Gestion des clients Gestion des clients" [ref=e311] [cursor=pointer]:
                - /url: /admin/customers
                - generic [ref=e313]:
                  - generic [ref=e314]: 👥
                  - paragraph [ref=e315]: Gestion des clients
                  - paragraph [ref=e316]: Gestion des clients
              - link "📁 Gérer les collections Gérer les collections" [ref=e317] [cursor=pointer]:
                - /url: /admin/collections
                - generic [ref=e319]:
                  - generic [ref=e320]: 📁
                  - paragraph [ref=e321]: Gérer les collections
                  - paragraph [ref=e322]: Gérer les collections
              - link "📝 Blog manage_blog" [ref=e323] [cursor=pointer]:
                - /url: /admin/blog
                - generic [ref=e325]:
                  - generic [ref=e326]: 📝
                  - paragraph [ref=e327]: Blog
                  - paragraph [ref=e328]: manage_blog
              - link "⚙️ Paramètres Paramètres du site" [ref=e329] [cursor=pointer]:
                - /url: /admin/settings
                - generic [ref=e331]:
                  - generic [ref=e332]: ⚙️
                  - paragraph [ref=e333]: Paramètres
                  - paragraph [ref=e334]: Paramètres du site
          - generic [ref=e335]:
            - paragraph [ref=e336]: Revenus et commandes
            - generic [ref=e337]:
              - link "Revenu total 0 DH" [ref=e339] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e340]: Revenu total
                - paragraph [ref=e341]: 0 DH
              - link "Revenu du jour 0 DH" [ref=e343] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e344]: Revenu du jour
                - paragraph [ref=e345]: 0 DH
              - link "Commandes aujourd'hui 0" [ref=e347] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e348]: Commandes aujourd'hui
                - paragraph [ref=e349]: "0"
              - link "Total des commandes 2" [ref=e351] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e352]: Total des commandes
                - paragraph [ref=e353]: "2"
              - link "Clients 2" [ref=e355] [cursor=pointer]:
                - /url: /admin/customers
                - paragraph [ref=e356]: Clients
                - paragraph [ref=e357]: "2"
              - link "pending 0" [ref=e359] [cursor=pointer]:
                - /url: /admin/orders?status=pending
                - paragraph [ref=e360]: pending
                - paragraph [ref=e361]: "0"
          - generic [ref=e362]:
            - paragraph [ref=e363]: Statut des commandes
            - generic [ref=e364]:
              - link "Traitement... 0" [ref=e366] [cursor=pointer]:
                - /url: /admin/orders?status=processing
                - paragraph [ref=e367]: Traitement...
                - paragraph [ref=e368]: "0"
              - link "delivered 0" [ref=e370] [cursor=pointer]:
                - /url: /admin/orders?status=delivered
                - paragraph [ref=e371]: delivered
                - paragraph [ref=e372]: "0"
              - link "cancelled 0" [ref=e374] [cursor=pointer]:
                - /url: /admin/orders?status=cancelled
                - paragraph [ref=e375]: cancelled
                - paragraph [ref=e376]: "0"
              - link "paid 0" [ref=e378] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e379]: paid
                - paragraph [ref=e380]: "0"
              - link "refunded 0" [ref=e382] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e383]: refunded
                - paragraph [ref=e384]: "0"
              - link "Produits 68" [ref=e386] [cursor=pointer]:
                - /url: /admin/shop
                - paragraph [ref=e387]: Produits
                - paragraph [ref=e388]: "68"
          - generic [ref=e389]:
            - paragraph [ref=e390]: Produits les plus vendus
            - generic [ref=e392]:
              - generic [ref=e393]:
                - generic [ref=e394]:
                  - generic [ref=e395]: "1"
                  - generic [ref=e396]: AIN SAISS 5L
                - generic [ref=e397]:
                  - generic [ref=e398]: 2vendu
                  - generic [ref=e399]: 46.00 DH
              - generic [ref=e400]:
                - generic [ref=e401]:
                  - generic [ref=e402]: "2"
                  - generic [ref=e403]: POMS 1L
                - generic [ref=e404]:
                  - generic [ref=e405]: 1vendu
                  - generic [ref=e406]: 59.45 DH
              - generic [ref=e407]:
                - generic [ref=e408]:
                  - generic [ref=e409]: "3"
                  - generic [ref=e410]: BAHIA 5L
                - generic [ref=e411]:
                  - generic [ref=e412]: 1vendu
                  - generic [ref=e413]: 0.00 DH
              - generic [ref=e414]:
                - generic [ref=e415]:
                  - generic [ref=e416]: "4"
                  - generic [ref=e417]: POMS MAXI 45 CL
                - generic [ref=e418]:
                  - generic [ref=e419]: 1vendu
                  - generic [ref=e420]: 72.00 DH
              - generic [ref=e421]:
                - generic [ref=e422]:
                  - generic [ref=e423]: "5"
                  - generic [ref=e424]: AIN SAISS 1.5L
                - generic [ref=e425]:
                  - generic [ref=e426]: 1vendu
                  - generic [ref=e427]: 25.20 DH
          - generic [ref=e428]:
            - paragraph [ref=e429]: Dernières commandes
            - generic [ref=e431]:
              - link "MON-MS8302OS-79C4D8 ilyass 98.93 DH out for delivery" [ref=e433] [cursor=pointer]:
                - /url: /admin/orders/8ad334fe-64cc-4bd2-9f8e-264eebb18a2b
                - generic [ref=e434]:
                  - paragraph [ref=e435]: MON-MS8302OS-79C4D8
                  - paragraph [ref=e436]: ilyass
                - generic [ref=e437]:
                  - paragraph [ref=e438]: 98.93 DH
                  - paragraph [ref=e439]: out for delivery
              - link "MON-MS7R9FHY-6D95C5 jhjhjhghj 164.65 DH out for delivery" [ref=e441] [cursor=pointer]:
                - /url: /admin/orders/4c72e130-0300-4cac-8a22-1606528787b1
                - generic [ref=e442]:
                  - paragraph [ref=e443]: MON-MS7R9FHY-6D95C5
                  - paragraph [ref=e444]: jhjhjhghj
                - generic [ref=e445]:
                  - paragraph [ref=e446]: 164.65 DH
                  - paragraph [ref=e447]: out for delivery
          - generic [ref=e448]:
            - paragraph [ref=e449]: Derniers clients
            - generic [ref=e451]:
              - link "ilyass ilyass@gmail.com 98.93 DH 1commandes" [ref=e453] [cursor=pointer]:
                - /url: /admin/customers
                - generic [ref=e454]:
                  - paragraph [ref=e455]: ilyass
                  - paragraph [ref=e456]: ilyass@gmail.com
                - generic [ref=e457]:
                  - paragraph [ref=e458]: 98.93 DH
                  - paragraph [ref=e459]: 1commandes
              - link "jhjhjhghj hghgfhgfgh@gmail.com 164.65 DH 1commandes" [ref=e461] [cursor=pointer]:
                - /url: /admin/customers
                - generic [ref=e462]:
                  - paragraph [ref=e463]: jhjhjhghj
                  - paragraph [ref=e464]: hghgfhgfgh@gmail.com
                - generic [ref=e465]:
                  - paragraph [ref=e466]: 164.65 DH
                  - paragraph [ref=e467]: 1commandes
          - generic [ref=e468]:
            - paragraph [ref=e469]: Produits à stock faible
            - generic [ref=e471]:
              - generic [ref=e472]:
                - generic [ref=e473]: UPDATE-TEST-1785619856415-UPDATED
                - generic [ref=e474]: 0restant
              - generic [ref=e475]:
                - generic [ref=e476]: DB-CONSISTENCY-1785619849779
                - generic [ref=e477]: 0restant
              - generic [ref=e478]:
                - generic [ref=e479]: UPDATE-TEST-1785617160295-UPDATED
                - generic [ref=e480]: 0restant
              - generic [ref=e481]:
                - generic [ref=e482]: DB-CONSISTENCY-1785617158065
                - generic [ref=e483]: 0restant
              - generic [ref=e484]:
                - generic [ref=e485]: UPDATE-TEST-1785616521096-UPDATED
                - generic [ref=e486]: 0restant
          - generic [ref=e487]:
            - paragraph [ref=e488]: Contenu
            - generic [ref=e489]:
              - link "Produits 68" [ref=e491] [cursor=pointer]:
                - /url: /admin/shop
                - paragraph [ref=e492]: Produits
                - paragraph [ref=e493]: "68"
              - link "Stock faible (≤5) 7" [ref=e495] [cursor=pointer]:
                - /url: /admin/shop
                - paragraph [ref=e496]: Stock faible (≤5)
                - paragraph [ref=e497]: "7"
              - link "Commandes payées 0" [ref=e499] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e500]: Commandes payées
                - paragraph [ref=e501]: "0"
              - link "refunded 0" [ref=e503] [cursor=pointer]:
                - /url: /admin/orders
                - paragraph [ref=e504]: refunded
                - paragraph [ref=e505]: "0"
  - region "Notifications alt+T"
  - alert [ref=e506]
  - generic [ref=e507]: 0k
```

# Test source

```ts
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
> 249 |   expect(verifyResult).toBe(404);
      |                        ^ Error: expect(received).toBe(expected) // Object.is equality
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
  260 |   await expect(page.locator("#p-name")).toBeVisible({ timeout: 10000 });
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