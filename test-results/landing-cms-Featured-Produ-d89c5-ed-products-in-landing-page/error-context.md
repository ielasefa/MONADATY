# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-cms.spec.ts >> Featured Products CMS >> admin can view featured products in landing page
- Location: e2e/landing-cms.spec.ts:95:7

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 8
Received:    7
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
          - link "Dashboard" [ref=e14] [cursor=pointer]:
            - /url: /admin/dashboard
            - generic [ref=e15]: ◇
            - text: Dashboard
          - link "Orders" [ref=e17] [cursor=pointer]:
            - /url: /admin/orders
            - generic [ref=e18]: ☰
            - text: Orders
          - link "Customers" [ref=e20] [cursor=pointer]:
            - /url: /admin/customers
            - generic [ref=e21]: ♢
            - text: Customers
          - link "Reports" [ref=e23] [cursor=pointer]:
            - /url: /admin/reports
            - generic [ref=e24]: ◎
            - text: Reports
          - link "Automation" [ref=e26] [cursor=pointer]:
            - /url: /admin/automation
            - generic [ref=e27]: ⚡
            - text: Automation
          - link "Security" [ref=e29] [cursor=pointer]:
            - /url: /admin/security
            - generic [ref=e30]: 🔒
            - text: Security
          - link "Landing Page" [ref=e32] [cursor=pointer]:
            - /url: /admin/landing
            - generic [ref=e33]: ◎
            - text: Landing Page
          - link "Shop" [ref=e36] [cursor=pointer]:
            - /url: /admin/shop
            - generic [ref=e37]: □
            - text: Shop
          - link "Categories" [ref=e39] [cursor=pointer]:
            - /url: /admin/categories
            - generic [ref=e40]: ⊞
            - text: Categories
          - link "Collections" [ref=e42] [cursor=pointer]:
            - /url: /admin/collections
            - generic [ref=e43]: ⊟
            - text: Collections
          - link "Blog" [ref=e45] [cursor=pointer]:
            - /url: /admin/blog
            - generic [ref=e46]: △
            - text: Blog
          - link "Inventory" [ref=e48] [cursor=pointer]:
            - /url: /admin/inventory
            - generic [ref=e49]: ▤
            - text: Inventory
          - link "Admins" [ref=e51] [cursor=pointer]:
            - /url: /admin/admins
            - generic [ref=e52]: ✦
            - text: Admins
          - link "Settings" [ref=e54] [cursor=pointer]:
            - /url: /admin/settings
            - generic [ref=e55]: ⚙
            - text: Settings
        - button "Déconnexion" [ref=e57] [cursor=pointer]:
          - generic [ref=e58]: ⏻
          - text: Déconnexion
      - main [ref=e59]:
        - button "Notifications" [ref=e63] [cursor=pointer]:
          - img [ref=e64]
        - generic [ref=e67]:
          - complementary [ref=e68]:
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Landing Page
                - generic [ref=e75]: draft
              - generic [ref=e76]: 8/1/2026
            - generic [ref=e77]:
              - paragraph [ref=e78]: Sections
              - list [ref=e79]:
                - listitem [ref=e80]:
                  - button "◇ Hero ⋮⋮" [ref=e81] [cursor=pointer]:
                    - generic [ref=e82]: ◇
                    - generic [ref=e83]: Hero
                    - generic [ref=e84]: ⋮⋮
                - listitem [ref=e85]:
                  - button "□ Featured Products ⋮⋮" [ref=e86] [cursor=pointer]:
                    - generic [ref=e87]: □
                    - generic [ref=e88]: Featured Products
                    - generic [ref=e89]: ⋮⋮
                - listitem [ref=e90]:
                  - button "⊞ Collections ⋮⋮" [ref=e91] [cursor=pointer]:
                    - generic [ref=e92]: ⊞
                    - generic [ref=e93]: Collections
                    - generic [ref=e94]: ⋮⋮
                - listitem [ref=e95]:
                  - button "△ Brand Story ⋮⋮" [ref=e96] [cursor=pointer]:
                    - generic [ref=e97]: △
                    - generic [ref=e98]: Brand Story
                    - generic [ref=e99]: ⋮⋮
                - listitem [ref=e100]:
                  - button "♢ Testimonials ⋮⋮" [ref=e101] [cursor=pointer]:
                    - generic [ref=e102]: ♢
                    - generic [ref=e103]: Testimonials
                    - generic [ref=e104]: ⋮⋮
                - listitem [ref=e105]:
                  - button "◎ Moroccan Moment ⋮⋮" [ref=e106] [cursor=pointer]:
                    - generic [ref=e107]: ◎
                    - generic [ref=e108]: Moroccan Moment
                    - generic [ref=e109]: ⋮⋮
                - listitem [ref=e110]:
                  - button "✉ Newsletter ⋮⋮" [ref=e111] [cursor=pointer]:
                    - generic [ref=e112]: ✉
                    - generic [ref=e113]: Newsletter
                    - generic [ref=e114]: ⋮⋮
                - listitem [ref=e115]:
                  - button "▶ Final CTA ⋮⋮" [ref=e116] [cursor=pointer]:
                    - generic [ref=e117]: ▶
                    - generic [ref=e118]: Final CTA
                    - generic [ref=e119]: ⋮⋮
            - generic [ref=e120]:
              - generic [ref=e121]:
                - generic [ref=e122]: 50 versions
                - button "History" [ref=e123] [cursor=pointer]
              - generic [ref=e124]: Ctrl+S to save
          - generic [ref=e125]:
            - generic [ref=e126]:
              - heading "Hero" [level=2] [ref=e128]
              - generic [ref=e129]:
                - generic [ref=e130]: ○ Draft
                - button "Save Draft" [ref=e131] [cursor=pointer]
                - button "Publish" [ref=e132] [cursor=pointer]
                - link "View Site" [ref=e133] [cursor=pointer]:
                  - /url: /
            - generic [ref=e135]:
              - generic [ref=e136]:
                - generic [ref=e138]:
                  - generic [ref=e139]: ⚙
                  - heading "Section Settings" [level=3] [ref=e140]
                - generic [ref=e141]:
                  - generic [ref=e142]:
                    - generic [ref=e143]: Background
                    - combobox [ref=e144]:
                      - option "Default" [selected]
                      - option "Surface"
                      - option "Burgundy"
                      - option "Dark Burgundy"
                      - option "Custom"
                  - generic [ref=e145]:
                    - generic [ref=e146]: Max Width
                    - combobox [ref=e147]:
                      - option "Standard (1400px)" [selected]
                      - option "Wide (1600px)"
                      - option "Full Width"
                  - generic [ref=e148]:
                    - generic [ref=e149]: Padding Top
                    - combobox [ref=e150]:
                      - option "Small (py-12)"
                      - option "Medium (py-16)" [selected]
                      - option "Large (py-20)"
                      - option "XL (py-24)"
                      - option "None"
                  - generic [ref=e151]:
                    - generic [ref=e152]: Padding Bottom
                    - combobox [ref=e153]:
                      - option "Small (py-12)"
                      - option "Medium (py-16)" [selected]
                      - option "Large (py-20)"
                      - option "XL (py-24)"
                      - option "None"
                  - generic [ref=e154]:
                    - generic [ref=e155]: Border Radius
                    - combobox [ref=e156]:
                      - option "None" [selected]
                      - option "Small"
                      - option "Medium"
                      - option "Large"
                      - option "XL"
                      - option "2XL"
                  - generic [ref=e157]:
                    - generic [ref=e158]: Animation
                    - combobox [ref=e159]:
                      - option "None"
                      - option "Fade Up" [selected]
                      - option "Fade In"
                      - option "Scale In"
              - generic [ref=e160]:
                - generic [ref=e162]:
                  - generic [ref=e163]: 👁
                  - heading "Visibility" [level=3] [ref=e164]
                - generic [ref=e165] [cursor=pointer]:
                  - switch "Show on homepage" [checked] [ref=e166]
                  - generic [ref=e168]: Show on homepage
              - generic [ref=e169]:
                - generic [ref=e171]:
                  - generic [ref=e172]: ◇
                  - heading "Content" [level=3] [ref=e173]
                - generic [ref=e174]:
                  - generic [ref=e175]:
                    - text: Headline
                    - textbox "Headline" [ref=e176]:
                      - /placeholder: TASTE\nREDEFINED.
                      - text: LE GOÛT,AUTREMENT.
                  - generic [ref=e177]:
                    - text: Subheadline
                    - textbox "Subheadline" [ref=e178]:
                      - /placeholder: Premium Soda — Moroccan Craft
                      - text: Soda crafted in Morocco
                - generic [ref=e179]:
                  - text: Description
                  - textbox "Description" [ref=e180]:
                    - /placeholder: A refined soda experience...
                    - text: Née au Maroc. Pensée autour du goût. MONADATY redéfinit ce que signifie une boisson premium.
                - generic [ref=e181]:
                  - text: Background Image
                  - generic [ref=e183] [cursor=pointer]:
                    - img [ref=e185]
                    - paragraph [ref=e188]: Déposer l'image ou cliquer pour téléverser
                    - paragraph [ref=e189]: JPG, PNG, WebP, AVIF — Up to 10 MB
                    - button "Camera" [ref=e190]:
                      - img [ref=e191]
                      - text: Camera
              - generic [ref=e194]:
                - generic [ref=e196]:
                  - generic [ref=e197]: ▶
                  - heading "Primary CTA" [level=3] [ref=e198]
                - generic [ref=e199]:
                  - generic [ref=e200]:
                    - text: Button Text
                    - textbox "Button Text" [ref=e201]:
                      - /placeholder: Shop MONADATY
                      - text: SHOP MONADATY
                  - generic [ref=e202]:
                    - text: Button Link
                    - textbox "Button Link" [ref=e203]:
                      - /placeholder: /shop
                      - text: /shop
                - generic [ref=e204]:
                  - generic [ref=e205]:
                    - generic [ref=e206]: Target
                    - combobox [ref=e207]:
                      - option "Same tab" [selected]
                      - option "New tab"
                  - generic [ref=e208]:
                    - generic [ref=e209]: Variant
                    - combobox [ref=e210]:
                      - option "Primary (Gold)" [selected]
                      - option "Outline"
                      - option "Burgundy"
                  - generic [ref=e211]:
                    - generic [ref=e212]: Alignment
                    - combobox [ref=e213]:
                      - option "Left" [selected]
                      - option "Center"
                      - option "Right"
              - generic [ref=e214]:
                - generic [ref=e216]:
                  - generic [ref=e217]: ◇
                  - heading "Secondary CTA" [level=3] [ref=e218]
                - generic [ref=e219]:
                  - generic [ref=e220]:
                    - text: Button Text
                    - textbox "Button Text" [ref=e221]:
                      - /placeholder: EXPLORE COLLECTIONS
                  - generic [ref=e222]:
                    - text: Button Link
                    - textbox "Button Link" [ref=e223]:
                      - /placeholder: /collections
              - generic [ref=e224]:
                - generic [ref=e226]:
                  - generic [ref=e227]: ⚙
                  - heading "Design" [level=3] [ref=e228]
                - generic [ref=e229]:
                  - generic [ref=e230]:
                    - text: Background Style
                    - textbox "Background Style" [ref=e231]:
                      - /placeholder: "#171717 or gradient..."
                  - generic [ref=e232]:
                    - text: Overlay Opacity (0–1)
                    - textbox "Overlay Opacity (0–1)" [ref=e233]:
                      - /placeholder: "0.0"
                      - text: "0"
          - complementary [ref=e234]:
            - generic [ref=e235]:
              - generic [ref=e236]: Preview
              - generic [ref=e237]:
                - button "1920px" [ref=e238] [cursor=pointer]
                - button "1440px" [ref=e239] [cursor=pointer]
                - button "768px" [ref=e240] [cursor=pointer]
                - button "375px" [ref=e241] [cursor=pointer]
            - generic [ref=e244]:
              - generic [ref=e248]:
                - generic [ref=e249]:
                  - generic [ref=e252]: Soda crafted in Morocco
                  - heading "LE GOÛT, AUTREMENT." [level=1] [ref=e253]
                  - paragraph [ref=e254]: Née au Maroc. Pensée autour du goût. MONADATY redéfinit ce que signifie une boisson premium.
                  - generic [ref=e255]:
                    - generic: SHOP MONADATY
                - generic [ref=e259]: M
              - generic [ref=e262]:
                - generic [ref=e263]:
                  - generic [ref=e264]:
                    - text: THE MONADATY EDIT
                    - heading "THREE WAYS TO TASTE IT." [level=2] [ref=e265]
                  - generic [ref=e266]: SHOP THE RANGE
                - generic [ref=e267]:
                  - generic [ref=e268]:
                    - img "COCA BOITE 25 CL" [ref=e270]
                    - heading "COCA BOITE 25 CL" [level=3] [ref=e271]
                    - paragraph [ref=e272]: 80.63 DH
                    - generic: Add to Cart
                  - generic [ref=e273]:
                    - img "HAWAI BOITE 25 CL" [ref=e275]
                    - heading "HAWAI BOITE 25 CL" [level=3] [ref=e276]
                    - paragraph [ref=e277]: 80.63 DH
                    - generic: Add to Cart
                  - generic [ref=e278]:
                    - img "SPRITE BOITE 25 CL" [ref=e280]
                    - heading "SPRITE BOITE 25 CL" [level=3] [ref=e281]
                    - paragraph [ref=e282]: 80.63 DH
                    - generic: Add to Cart
              - generic [ref=e285]:
                - generic [ref=e286]:
                  - generic [ref=e289]: CURATED FOR THE CURIOUS
                  - heading "COLLECTED BY TASTE." [level=2] [ref=e291]
                - paragraph [ref=e293]: No collections enabled
              - generic [ref=e297]:
                - generic [ref=e300]: M
                - generic [ref=e301]:
                  - text: BORN IN MOROCCO
                  - heading "BORN IN MOROCCO. BUILT AROUND TASTE." [level=2] [ref=e302]
                  - paragraph [ref=e303]: Carefully sourced ingredients, intentionally crafted blends, and service designed for Morocco.
                  - generic [ref=e304]:
                    - generic: Read Our Story
              - generic [ref=e307]:
                - generic [ref=e308]:
                  - generic [ref=e311]: WHAT THEY SAY
                  - heading "Testimonials" [level=2] [ref=e313]
                - generic [ref=e314]:
                  - article [ref=e315]:
                    - paragraph [ref=e316]: “MONADATY's Golden Citrus is absolutely refreshing. The quality is unmatched!”
                    - generic [ref=e317]:
                      - generic [ref=e318]: S
                      - generic [ref=e319]:
                        - paragraph [ref=e320]: Sofia A.
                        - paragraph [ref=e321]: Casablanca
                  - article [ref=e322]:
                    - paragraph [ref=e323]: “Finally, a Moroccan soda brand that competes with international premium labels. Bravo!”
                    - generic [ref=e324]:
                      - generic [ref=e325]: "Y"
                      - generic [ref=e326]:
                        - paragraph [ref=e327]: Youssef M.
                        - paragraph [ref=e328]: Rabat
                  - article [ref=e329]:
                    - paragraph [ref=e330]: “The Rose Lychee is my go-to gift for friends. Everyone loves it!”
                    - generic [ref=e331]:
                      - generic [ref=e332]: L
                      - generic [ref=e333]:
                        - paragraph [ref=e334]: Laila K.
                        - paragraph [ref=e335]: Marrakech
              - generic [ref=e339]:
                - generic [ref=e343]: POUR · SERVE · SAVOR
                - generic [ref=e344]:
                  - generic [ref=e347]: THE MONADATY MOMENT
                  - heading "Pour. Serve. Savor." [level=2] [ref=e348]
                  - paragraph [ref=e349]: MONADATY is designed for the good moments.
              - generic [ref=e353]:
                - generic [ref=e356]: BEGIN THE POUR
                - heading "YOUR NEXT FAVORITE TASTE IS WAITING." [level=2] [ref=e358]
                - paragraph [ref=e359]: Discover the MONADATY collection.
                - generic [ref=e360]:
                  - link "SHOP NOW" [ref=e361] [cursor=pointer]:
                    - /url: /shop
                  - link "OUR STORY" [ref=e362] [cursor=pointer]:
                    - /url: /about
                - paragraph [ref=e363]: Preview — links open in new tab
  - region "Notifications alt+T"
  - alert [ref=e364]
```

# Test source

```ts
  2   | 
  3   | const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
  4   | const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
  5   | 
  6   | async function loginViaAPI(page: Page) {
  7   |   await page.goto("/admin/login");
  8   |   await page.waitForLoadState("domcontentloaded");
  9   |   const ok = await page.evaluate(async ({ email, password }) => {
  10  |     const res = await fetch("/api/admin/login", {
  11  |       method: "POST",
  12  |       headers: { "Content-Type": "application/json" },
  13  |       body: JSON.stringify({ email, password }),
  14  |     });
  15  |     return res.ok;
  16  |   }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  17  |   expect(ok).toBe(true);
  18  |   // Override mustChange cookie to prevent middleware redirect to change-password
  19  |   await page.context().addCookies([{
  20  |     name: "admin_must_change",
  21  |     value: "0",
  22  |     domain: "localhost",
  23  |     path: "/",
  24  |   }]);
  25  |   await page.goto("/admin/dashboard", { waitUntil: "load", timeout: 30000 });
  26  |   await page.waitForURL(/\/admin\/dashboard/);
  27  | }
  28  | 
  29  | test.describe("Login Redirect", () => {
  30  |   test("login redirects to dashboard without manual refresh", async ({ page }) => {
  31  |     await page.goto("/admin/login");
  32  |     await page.waitForLoadState("domcontentloaded");
  33  |     await page.waitForSelector("#login-email", { timeout: 10000 });
  34  | 
  35  |     await page.fill("#login-email", ADMIN_EMAIL);
  36  |     await page.fill("#login-password", ADMIN_PASSWORD);
  37  |     await page.click('button[type="submit"]');
  38  | 
  39  |     await page.waitForURL(/\/admin\/(dashboard|change-password)/, { timeout: 20000 });
  40  |     await expect(page).toHaveURL(/\/admin\/(dashboard|change-password)/);
  41  | 
  42  |     const url = page.url();
  43  |     if (url.includes("change-password")) {
  44  |       await page.fill("#new-password", ADMIN_PASSWORD + "!");
  45  |       await page.fill("#confirm-password", ADMIN_PASSWORD + "!");
  46  |       await page.click('button[type="submit"]');
  47  |       await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
  48  |     }
  49  | 
  50  |     await expect(page).toHaveURL(/\/admin\/dashboard/);
  51  |   });
  52  | 
  53  |   test("login with redirect param goes to correct page", async ({ page }) => {
  54  |     await page.goto("/admin/login?redirect=/admin/products");
  55  |     await page.waitForLoadState("domcontentloaded");
  56  |     await page.waitForSelector("#login-email", { timeout: 10000 });
  57  | 
  58  |     await page.fill("#login-email", ADMIN_EMAIL);
  59  |     await page.fill("#login-password", ADMIN_PASSWORD);
  60  |     await page.click('button[type="submit"]');
  61  | 
  62  |     await page.waitForURL(/\/admin\/(products|change-password)/, { timeout: 20000 });
  63  |     const url = page.url();
  64  |     if (url.includes("change-password")) {
  65  |       await page.fill("#new-password", ADMIN_PASSWORD + "!");
  66  |       await page.fill("#confirm-password", ADMIN_PASSWORD + "!");
  67  |       await page.click('button[type="submit"]');
  68  |       await page.waitForURL(/\/admin\/products/, { timeout: 15000 });
  69  |     }
  70  | 
  71  |     await expect(page).toHaveURL(/\/admin\/products/);
  72  |   });
  73  | });
  74  | 
  75  | test.describe("Featured Products CMS", () => {
  76  |   test("landing page featured section uses DB-controlled products", async ({ page }) => {
  77  |     const response = await page.goto("/");
  78  |     expect(response?.status()).toBe(200);
  79  |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  80  | 
  81  |     const featuredSection = page.locator("#products");
  82  |     const isSectionVisible = await featuredSection.isVisible({ timeout: 5000 }).catch(() => false);
  83  | 
  84  |     if (isSectionVisible) {
  85  |       const initialContent = await featuredSection.textContent();
  86  | 
  87  |       const secondResponse = await page.goto("/");
  88  |       expect(secondResponse?.status()).toBe(200);
  89  |       await page.waitForLoadState("networkidle", { timeout: 15000 });
  90  |       const afterContent = await featuredSection.textContent();
  91  |       expect(afterContent).toBe(initialContent);
  92  |     }
  93  |   });
  94  | 
  95  |   test("admin can view featured products in landing page", async ({ page }) => {
  96  |     await loginViaAPI(page);
  97  |     await page.goto("/admin/landing");
  98  |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  99  | 
  100 |     const tabs = page.locator(".border-b button");
  101 |     const count = await tabs.count();
> 102 |     expect(count).toBeGreaterThanOrEqual(8);
      |                   ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  103 | 
  104 |     await tabs.nth(1).click();
  105 |     await page.waitForTimeout(1000);
  106 | 
  107 |     const sectionCard = page.locator(".luxury-card").first();
  108 |     await expect(sectionCard).toBeVisible({ timeout: 5000 });
  109 |   });
  110 | 
  111 |   test("admin can interact with featured products form", async ({ page }) => {
  112 |     await loginViaAPI(page);
  113 |     await page.goto("/admin/landing");
  114 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  115 | 
  116 |     const tabs = page.locator(".border-b button");
  117 |     await tabs.nth(1).click();
  118 |     await page.waitForTimeout(1000);
  119 | 
  120 |     const saveBtn = page.locator("button[type='submit']").first();
  121 |     if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  122 |       await saveBtn.click();
  123 |       await page.waitForTimeout(2000);
  124 |     }
  125 |   });
  126 | });
  127 | 
  128 | test.describe("Landing CMS", () => {
  129 |   test("admin can access all CMS tabs", async ({ page }) => {
  130 |     await loginViaAPI(page);
  131 |     await page.goto("/admin/landing");
  132 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  133 | 
  134 |     const tabs = page.locator(".border-b button");
  135 |     const count = await tabs.count();
  136 |     expect(count).toBeGreaterThanOrEqual(8);
  137 | 
  138 |     for (let i = 0; i < Math.min(count, 10); i++) {
  139 |       await tabs.nth(i).click();
  140 |       await page.waitForTimeout(300);
  141 |       const sectionCard = page.locator(".luxury-card").first();
  142 |       await expect(sectionCard).toBeVisible({ timeout: 3000 });
  143 |     }
  144 |   });
  145 | 
  146 |   test("announcement bar settings can be saved", async ({ page }) => {
  147 |     await loginViaAPI(page);
  148 |     await page.goto("/admin/landing");
  149 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  150 | 
  151 |     const tabs = page.locator(".border-b button");
  152 |     const count = await tabs.count();
  153 | 
  154 |     // Navigate to last tabs (announcement, newsletter)
  155 |     if (count >= 9) {
  156 |       await tabs.nth(8).click();
  157 |       await page.waitForTimeout(500);
  158 | 
  159 |       const saveBtn = page.locator("button[type='submit']:has-text('Save')").first();
  160 |       if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  161 |         await saveBtn.click();
  162 |         await page.waitForTimeout(2000);
  163 |       }
  164 |     }
  165 |   });
  166 | 
  167 |   test("newsletter settings can be saved", async ({ page }) => {
  168 |     await loginViaAPI(page);
  169 |     await page.goto("/admin/landing");
  170 |     await page.waitForLoadState("networkidle", { timeout: 15000 });
  171 | 
  172 |     const tabs = page.locator(".border-b button");
  173 |     const count = await tabs.count();
  174 | 
  175 |     if (count >= 10) {
  176 |       await tabs.nth(9).click();
  177 |       await page.waitForTimeout(500);
  178 | 
  179 |       const saveBtn = page.locator("button[type='submit']:has-text('Save')").first();
  180 |       if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  181 |         await saveBtn.click();
  182 |         await page.waitForTimeout(2000);
  183 |       }
  184 |     }
  185 |   });
  186 | });
  187 | 
```