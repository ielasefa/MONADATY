# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing-cms.spec.ts >> Landing CMS >> admin can access all CMS tabs
- Location: e2e/landing-cms.spec.ts:129:7

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
          - link "Dashboard" [ref=e13] [cursor=pointer]:
            - /url: /admin/dashboard
            - generic [ref=e14]: ◇
            - text: Dashboard
          - link "Orders" [ref=e15] [cursor=pointer]:
            - /url: /admin/orders
            - generic [ref=e16]: ☰
            - text: Orders
          - link "Customers" [ref=e17] [cursor=pointer]:
            - /url: /admin/customers
            - generic [ref=e18]: ♢
            - text: Customers
          - link "Reports" [ref=e19] [cursor=pointer]:
            - /url: /admin/reports
            - generic [ref=e20]: ◎
            - text: Reports
          - link "Automation" [ref=e21] [cursor=pointer]:
            - /url: /admin/automation
            - generic [ref=e22]: ⚡
            - text: Automation
          - link "Security" [ref=e23] [cursor=pointer]:
            - /url: /admin/security
            - generic [ref=e24]: 🔒
            - text: Security
          - link "Landing Page" [ref=e25] [cursor=pointer]:
            - /url: /admin/landing
            - generic [ref=e26]: ◎
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
        - generic [ref=e53]:
          - complementary [ref=e54]:
            - generic [ref=e56]:
              - generic [ref=e57]:
                - paragraph [ref=e58]: Landing Page
                - generic [ref=e61]: draft
              - generic [ref=e62]: 8/1/2026
            - generic [ref=e63]:
              - paragraph [ref=e64]: Sections
              - list [ref=e65]:
                - listitem [ref=e66]:
                  - button "◇ Hero ⋮⋮" [ref=e67] [cursor=pointer]:
                    - generic [ref=e68]: ◇
                    - generic [ref=e69]: Hero
                    - generic [ref=e70]: ⋮⋮
                - listitem [ref=e71]:
                  - button "□ Featured Products ⋮⋮" [ref=e72] [cursor=pointer]:
                    - generic [ref=e73]: □
                    - generic [ref=e74]: Featured Products
                    - generic [ref=e75]: ⋮⋮
                - listitem [ref=e76]:
                  - button "⊞ Collections ⋮⋮" [ref=e77] [cursor=pointer]:
                    - generic [ref=e78]: ⊞
                    - generic [ref=e79]: Collections
                    - generic [ref=e80]: ⋮⋮
                - listitem [ref=e81]:
                  - button "△ Brand Story ⋮⋮" [ref=e82] [cursor=pointer]:
                    - generic [ref=e83]: △
                    - generic [ref=e84]: Brand Story
                    - generic [ref=e85]: ⋮⋮
                - listitem [ref=e86]:
                  - button "♢ Testimonials ⋮⋮" [ref=e87] [cursor=pointer]:
                    - generic [ref=e88]: ♢
                    - generic [ref=e89]: Testimonials
                    - generic [ref=e90]: ⋮⋮
                - listitem [ref=e91]:
                  - button "◎ Moroccan Moment ⋮⋮" [ref=e92] [cursor=pointer]:
                    - generic [ref=e93]: ◎
                    - generic [ref=e94]: Moroccan Moment
                    - generic [ref=e95]: ⋮⋮
                - listitem [ref=e96]:
                  - button "✉ Newsletter ⋮⋮" [ref=e97] [cursor=pointer]:
                    - generic [ref=e98]: ✉
                    - generic [ref=e99]: Newsletter
                    - generic [ref=e100]: ⋮⋮
                - listitem [ref=e101]:
                  - button "▶ Final CTA ⋮⋮" [ref=e102] [cursor=pointer]:
                    - generic [ref=e103]: ▶
                    - generic [ref=e104]: Final CTA
                    - generic [ref=e105]: ⋮⋮
            - generic [ref=e106]:
              - generic [ref=e107]:
                - generic [ref=e108]: 50 versions
                - button "History" [ref=e109] [cursor=pointer]
              - generic [ref=e110]: Ctrl+S to save
          - generic [ref=e111]:
            - generic [ref=e112]:
              - heading "Hero" [level=2] [ref=e114]
              - generic [ref=e115]:
                - generic [ref=e116]: ○ Draft
                - button "Save Draft" [ref=e117] [cursor=pointer]
                - button "Publish" [ref=e118] [cursor=pointer]
                - link "View Site" [ref=e119] [cursor=pointer]:
                  - /url: /
            - generic [ref=e121]:
              - generic [ref=e122]:
                - generic [ref=e124]:
                  - generic [ref=e125]: ⚙
                  - heading "Section Settings" [level=3] [ref=e126]
                - generic [ref=e127]:
                  - generic [ref=e128]:
                    - generic [ref=e129]: Background
                    - combobox [ref=e130]:
                      - option "Default" [selected]
                      - option "Surface"
                      - option "Burgundy"
                      - option "Dark Burgundy"
                      - option "Custom"
                  - generic [ref=e131]:
                    - generic [ref=e132]: Max Width
                    - combobox [ref=e133]:
                      - option "Standard (1400px)" [selected]
                      - option "Wide (1600px)"
                      - option "Full Width"
                  - generic [ref=e134]:
                    - generic [ref=e135]: Padding Top
                    - combobox [ref=e136]:
                      - option "Small (py-12)"
                      - option "Medium (py-16)" [selected]
                      - option "Large (py-20)"
                      - option "XL (py-24)"
                      - option "None"
                  - generic [ref=e137]:
                    - generic [ref=e138]: Padding Bottom
                    - combobox [ref=e139]:
                      - option "Small (py-12)"
                      - option "Medium (py-16)" [selected]
                      - option "Large (py-20)"
                      - option "XL (py-24)"
                      - option "None"
                  - generic [ref=e140]:
                    - generic [ref=e141]: Border Radius
                    - combobox [ref=e142]:
                      - option "None" [selected]
                      - option "Small"
                      - option "Medium"
                      - option "Large"
                      - option "XL"
                      - option "2XL"
                  - generic [ref=e143]:
                    - generic [ref=e144]: Animation
                    - combobox [ref=e145]:
                      - option "None"
                      - option "Fade Up" [selected]
                      - option "Fade In"
                      - option "Scale In"
              - generic [ref=e146]:
                - generic [ref=e148]:
                  - generic [ref=e149]: 👁
                  - heading "Visibility" [level=3] [ref=e150]
                - generic [ref=e151] [cursor=pointer]:
                  - switch "Show on homepage" [checked] [ref=e152]
                  - generic [ref=e154]: Show on homepage
              - generic [ref=e155]:
                - generic [ref=e157]:
                  - generic [ref=e158]: ◇
                  - heading "Content" [level=3] [ref=e159]
                - generic [ref=e160]:
                  - generic [ref=e161]:
                    - text: Headline
                    - textbox "Headline" [ref=e162]:
                      - /placeholder: TASTE\nREDEFINED.
                      - text: LE GOÛT,AUTREMENT.
                  - generic [ref=e163]:
                    - text: Subheadline
                    - textbox "Subheadline" [ref=e164]:
                      - /placeholder: Premium Soda — Moroccan Craft
                      - text: Soda crafted in Morocco
                - generic [ref=e165]:
                  - text: Description
                  - textbox "Description" [ref=e166]:
                    - /placeholder: A refined soda experience...
                    - text: Née au Maroc. Pensée autour du goût. MONADATY redéfinit ce que signifie une boisson premium.
                - generic [ref=e167]:
                  - text: Background Image
                  - generic [ref=e169] [cursor=pointer]:
                    - img [ref=e171]
                    - paragraph [ref=e174]: Déposer l'image ou cliquer pour téléverser
                    - paragraph [ref=e175]: JPG, PNG, WebP, AVIF — Up to 10 MB
                    - button "Camera" [ref=e176]:
                      - img [ref=e177]
                      - text: Camera
              - generic [ref=e180]:
                - generic [ref=e182]:
                  - generic [ref=e183]: ▶
                  - heading "Primary CTA" [level=3] [ref=e184]
                - generic [ref=e185]:
                  - generic [ref=e186]:
                    - text: Button Text
                    - textbox "Button Text" [ref=e187]:
                      - /placeholder: Shop MONADATY
                      - text: SHOP MONADATY
                  - generic [ref=e188]:
                    - text: Button Link
                    - textbox "Button Link" [ref=e189]:
                      - /placeholder: /shop
                      - text: /shop
                - generic [ref=e190]:
                  - generic [ref=e191]:
                    - generic [ref=e192]: Target
                    - combobox [ref=e193]:
                      - option "Same tab" [selected]
                      - option "New tab"
                  - generic [ref=e194]:
                    - generic [ref=e195]: Variant
                    - combobox [ref=e196]:
                      - option "Primary (Gold)" [selected]
                      - option "Outline"
                      - option "Burgundy"
                  - generic [ref=e197]:
                    - generic [ref=e198]: Alignment
                    - combobox [ref=e199]:
                      - option "Left" [selected]
                      - option "Center"
                      - option "Right"
              - generic [ref=e200]:
                - generic [ref=e202]:
                  - generic [ref=e203]: ◇
                  - heading "Secondary CTA" [level=3] [ref=e204]
                - generic [ref=e205]:
                  - generic [ref=e206]:
                    - text: Button Text
                    - textbox "Button Text" [ref=e207]:
                      - /placeholder: EXPLORE COLLECTIONS
                  - generic [ref=e208]:
                    - text: Button Link
                    - textbox "Button Link" [ref=e209]:
                      - /placeholder: /collections
              - generic [ref=e210]:
                - generic [ref=e212]:
                  - generic [ref=e213]: ⚙
                  - heading "Design" [level=3] [ref=e214]
                - generic [ref=e215]:
                  - generic [ref=e216]:
                    - text: Background Style
                    - textbox "Background Style" [ref=e217]:
                      - /placeholder: "#171717 or gradient..."
                  - generic [ref=e218]:
                    - text: Overlay Opacity (0–1)
                    - textbox "Overlay Opacity (0–1)" [ref=e219]:
                      - /placeholder: "0.0"
                      - text: "0"
          - complementary [ref=e220]:
            - generic [ref=e221]:
              - generic [ref=e222]: Preview
              - generic [ref=e223]:
                - button "1920px" [ref=e224] [cursor=pointer]
                - button "1440px" [ref=e225] [cursor=pointer]
                - button "768px" [ref=e226] [cursor=pointer]
                - button "375px" [ref=e227] [cursor=pointer]
            - generic [ref=e230]:
              - generic [ref=e233]:
                - generic [ref=e234]:
                  - generic [ref=e237]: Soda crafted in Morocco
                  - heading "LE GOÛT, AUTREMENT." [level=1] [ref=e238]
                  - paragraph [ref=e239]: Née au Maroc. Pensée autour du goût. MONADATY redéfinit ce que signifie une boisson premium.
                  - generic [ref=e240]:
                    - generic: SHOP MONADATY
                - generic [ref=e244]: M
              - generic [ref=e246]:
                - generic [ref=e247]:
                  - generic [ref=e248]:
                    - text: THE MONADATY EDIT
                    - heading "THREE WAYS TO TASTE IT." [level=2] [ref=e249]
                  - generic [ref=e250]: SHOP THE RANGE
                - generic [ref=e251]:
                  - generic [ref=e252]:
                    - img "COCA BOITE 25 CL" [ref=e254]
                    - heading "COCA BOITE 25 CL" [level=3] [ref=e255]
                    - paragraph [ref=e256]: 80.63 DH
                    - generic: Add to Cart
                  - generic [ref=e257]:
                    - img "HAWAI BOITE 25 CL" [ref=e259]
                    - heading "HAWAI BOITE 25 CL" [level=3] [ref=e260]
                    - paragraph [ref=e261]: 80.63 DH
                    - generic: Add to Cart
                  - generic [ref=e262]:
                    - img "SPRITE BOITE 25 CL" [ref=e264]
                    - heading "SPRITE BOITE 25 CL" [level=3] [ref=e265]
                    - paragraph [ref=e266]: 80.63 DH
                    - generic: Add to Cart
              - generic [ref=e269]:
                - generic [ref=e272]: M
                - generic [ref=e273]:
                  - text: BORN IN MOROCCO
                  - heading "BORN IN MOROCCO. BUILT AROUND TASTE." [level=2] [ref=e274]
                  - paragraph [ref=e275]: Carefully sourced ingredients, intentionally crafted blends, and service designed for Morocco.
                  - generic [ref=e276]:
                    - generic: Read Our Story
              - generic [ref=e278]:
                - generic [ref=e279]:
                  - generic [ref=e282]: WHAT THEY SAY
                  - heading "Testimonials" [level=2] [ref=e284]
                - generic [ref=e285]:
                  - article [ref=e286]:
                    - paragraph [ref=e287]: “MONADATY's Golden Citrus is absolutely refreshing. The quality is unmatched!”
                    - generic [ref=e288]:
                      - generic [ref=e289]: S
                      - generic [ref=e290]:
                        - paragraph [ref=e291]: Sofia A.
                        - paragraph [ref=e292]: Casablanca
                  - article [ref=e293]:
                    - paragraph [ref=e294]: “Finally, a Moroccan soda brand that competes with international premium labels. Bravo!”
                    - generic [ref=e295]:
                      - generic [ref=e296]: "Y"
                      - generic [ref=e297]:
                        - paragraph [ref=e298]: Youssef M.
                        - paragraph [ref=e299]: Rabat
                  - article [ref=e300]:
                    - paragraph [ref=e301]: “The Rose Lychee is my go-to gift for friends. Everyone loves it!”
                    - generic [ref=e302]:
                      - generic [ref=e303]: L
                      - generic [ref=e304]:
                        - paragraph [ref=e305]: Laila K.
                        - paragraph [ref=e306]: Marrakech
              - generic [ref=e309]:
                - generic [ref=e313]: POUR · SERVE · SAVOR
                - generic [ref=e314]:
                  - generic [ref=e317]: THE MONADATY MOMENT
                  - heading "Pour. Serve. Savor." [level=2] [ref=e318]
                  - paragraph [ref=e319]: MONADATY is designed for the good moments.
              - generic [ref=e322]:
                - generic [ref=e325]: BEGIN THE POUR
                - heading "YOUR NEXT FAVORITE TASTE IS WAITING." [level=2] [ref=e327]
                - paragraph [ref=e328]: Discover the MONADATY collection.
                - generic [ref=e329]:
                  - link "SHOP NOW" [ref=e330] [cursor=pointer]:
                    - /url: /shop
                  - link "OUR STORY" [ref=e331] [cursor=pointer]:
                    - /url: /about
                - paragraph [ref=e332]: Preview — links open in new tab
  - region "Notifications alt+T"
  - generic [ref=e338] [cursor=pointer]:
    - button "Open issues overlay" [ref=e339]:
      - img [ref=e341]
      - generic [ref=e343]:
        - generic [ref=e344]: "0"
        - generic [ref=e345]: "1"
      - generic [ref=e346]: Issue
    - button "Collapse issues badge" [ref=e347]:
      - img [ref=e348]
  - alert [ref=e350]
```

# Test source

```ts
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
  102 |     expect(count).toBeGreaterThanOrEqual(8);
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
> 136 |     expect(count).toBeGreaterThanOrEqual(8);
      |                   ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
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