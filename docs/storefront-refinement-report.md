# MONADATY refinement report — 25 November 2026

## Audit and implementation

The initial review found 6–13px functional text, large tracking, inconsistent section gutters, different image ratios across product cards, and three featured products occupying a four-column grid. Mobile category chips pushed merchandise below the first screens. Navigation featured empty seed categories, collections showed only three hardcoded brands, and the footer included unsupported `#` destinations. Reduced-motion browser captures recorded 29 hydration warnings. Testimonial copy was being substituted with bundled marketing text and five implied stars.

The refinement establishes shared containers, readable functional type, fixed two-line product titles, square product media, aligned quantity and action rows, matching skeletons, balanced CMS selections and a mobile hero with independent media and text. Burgundy, warm white and restrained metallic gold remain the primary identity. Product detail titles and prices use Inter; Noto Sans Arabic supplies readable Arabic typography and natural tracking.

Homepage and navigation prioritize populated catalogue categories and populated collections. All database collections remain accessible on the collections page, with actual counts and no hardcoded brand priority. The footer links to supported destinations and current collections. Existing product photography, prices, availability and selection data are preserved.

Authored CMS hero overrides are visible, known bundled seed strings receive localized B2B defaults, and missing functional translations have French/English/Arabic fallbacks. The CMS translation table takes precedence. Testimonials display the stored content without replacement quotes or inferred ratings. Existing editorial collection artwork remains as supplied, including its original branding. Opaque white collection panels keep the interface labels readable alongside that artwork.

Motion uses a shared hydration-safe preference hook, restrained photo fades and accessible reduced-motion behavior. Continuous eyebrow animation and heavy collection shadows were removed. Filters now support Escape, focus trapping and focus restoration. Cart Escape is handled in the capture phase.

Protected administration received scoped typography, secondary colors, form-control and shared-component refinements. There are no new routes, database schema changes, changes to permissions or authentication, or changes to commerce calculations in this refinement.

## Verification

- `npm run lint`: passed without warnings or errors. The production build also completed its lint and type checks.
- `npm run typecheck`: passed.
- `npm test`: all 192 unit and integration tests passed across 26 files.
- Production build: passed and served locally for browser checks.
- Existing public Playwright image/navigation regression suite: 3 tests passed, including delayed images, client navigation, and returning from admin sign-in to the storefront.
- Commerce interaction QA: all 9 checks passed for search/URL synchronization, empty results, price sorting, filter keyboard focus and Escape, favorites, quantities, cart dismissal, required checkout fields and mobile navigation. No order was submitted.
- Responsive QA: 168 viewport checks passed at 360, 390, 768, 1024, 1440 and 1920px. Coverage includes the 12 public states in French and Arabic, populated checkout in both languages, and both cart directions. No horizontal overflow, unexpected browser errors, failed image/static assets, missing image alternatives, unnamed fields or raw translation keys were found in the main route checks.
- axe-core: 25 checks against WCAG 2 A/AA and 2.1 AA tags reported 0 automated violations. This is an automated scan, not a full accessibility certification.
- Product cards: all 12 language/viewport samples had square media and a 0px action-row alignment difference within the first row.
- Sticky navigation remained between 8 and 20px from the viewport top after 1400px of scrolling at all six widths, with the requested 20px corners.
- All six protected admin paths redirected to sign-in for an unauthenticated browser.

Detailed results: [summary](../visual-qa/refinement/after/summary.json), [route/card/sticky/accessibility checks](../visual-qa/refinement/after/checks.json), [cart and Arabic checkout](../visual-qa/refinement/after/buying-checks.json), [interactions](../visual-qa/refinement/after/interactions.json), and [quality-gate logs](../visual-qa/refinement/logs/).

## Screenshots

- [Before captures](../visual-qa/refinement/before/) — 390px and 1440px first-viewport captures of all 12 public states, plus cart and populated checkout.
- [After captures](../visual-qa/refinement/after/) — full-page desktop and mobile captures in French and Arabic, cart, populated checkout and populated favorites.
- [Homepage before, desktop](../visual-qa/refinement/before/home-1440.jpg) / [after, desktop](../visual-qa/refinement/after/home-1440.jpg).
- [Homepage before, mobile](../visual-qa/refinement/before/home-390.jpg) / [after, mobile](../visual-qa/refinement/after/home-390.jpg).
- [Design system](./storefront-design-system.md).

Screenshots use the actual local catalogue. Before and after captures have different page lengths, so they are visual references rather than a pixel-diff baseline.

## Verification limits

The six protected admin paths were checked for unauthenticated redirects. Their authenticated views, password changes, administration writes and live order submission were not browser-verified. Existing user sessions were preserved. The order-confirmation route was inspected in its no-order state; an actual confirmation and invoice download require a real authorized order. Existing loading components were source-reviewed and the image-loading regression test exercised delayed image loading. No screen-reader session, physical-device run, payment transaction or complete authenticated/mutating E2E run is claimed. Authored single-language CMS text, collection names and product data remain in their stored language.

## Repeating public checks

Run the local application with `npm run dev`. The development command starts the documented local database workflow. Then run:

```sh
node scripts/storefront-visual-qa.cjs
node scripts/storefront-interaction-qa.cjs
node scripts/storefront-buying-qa.cjs
npm run lint
npm run typecheck
npm test
```

`MONADATY_QA_URL` can point the three QA scripts at a local production build. The visual script checks both French and Arabic, saves screenshots, runs axe-core and verifies sticky navigation. The interaction script exercises search, sorting, filters, wishlist, cart and required-field feedback without submitting an order. Production build verification used the existing local database and the application's required production storage/origin environment configuration.

## Changed source inventory

This inventory includes the preceding implementation work in the same uncommitted workspace, including the existing local startup/database compatibility fixes. Asset restoration and the design-system file are documented separately.

- `app/about/page.tsx`
- `app/admin/admins/AdminManagement.tsx`
- `app/admin/automation/page.tsx`
- `app/admin/categories/CategoriesClient.tsx`
- `app/admin/change-password/page.tsx`
- `app/admin/collections-showcase/CollectionShowcaseClient.tsx`
- `app/admin/collections/CollectionsClient.tsx`
- `app/admin/customers/CustomersClient.tsx`
- `app/admin/dashboard/error.tsx`
- `app/admin/inventory/InventoryDashboardClient.tsx`
- `app/admin/inventory/audit/AuditLogClient.tsx`
- `app/admin/inventory/purchase-orders/PurchaseOrdersClient.tsx`
- `app/admin/inventory/purchase-orders/[id]/PurchaseOrderDetailClient.tsx`
- `app/admin/inventory/suppliers/SuppliersClient.tsx`
- `app/admin/inventory/warehouses/WarehousesClient.tsx`
- `app/admin/invoices/page.tsx`
- `app/admin/landing/LandingCMS.tsx`
- `app/admin/landing/LandingForm.tsx`
- `app/admin/login/page.tsx`
- `app/admin/orders/[id]/page.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/products/page.tsx`
- `app/admin/reports/customers/page.tsx`
- `app/admin/reports/orders/page.tsx`
- `app/admin/security/api-keys/page.tsx`
- `app/admin/security/audit-logs/page.tsx`
- `app/admin/security/page.tsx`
- `app/admin/settings/SettingsForm.tsx`
- `app/admin/settings/page.tsx`
- `app/admin/shop/ShopForm.tsx`
- `app/admin/translations/page.tsx`
- `app/checkout/loading.tsx`
- `app/checkout/page.tsx`
- `app/collections/loading.tsx`
- `app/collections/page.tsx`
- `app/error.tsx`
- `app/global-error.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/offline/page.tsx`
- `app/page.tsx`
- `app/product/[id]/error.tsx`
- `app/product/[id]/page.tsx`
- `app/shop/error.tsx`
- `app/shop/page.tsx`
- `app/success/SuccessClient.tsx`
- `app/success/loading.tsx`
- `app/success/page.tsx`
- `app/wishlist/loading.tsx`
- `app/wishlist/page.tsx`
- `components/CartDrawer.tsx`
- `components/CheckoutClient.tsx`
- `components/CheckoutFlow.tsx`
- `components/CollectionArtwork.tsx`
- `components/CollectionCard.tsx`
- `components/CommandPalette.tsx`
- `components/EmptyState.tsx`
- `components/FilterSidebar.tsx`
- `components/Footer.tsx`
- `components/FooterWrapper.tsx`
- `components/Hero.tsx`
- `components/HomepageCommerce.tsx`
- `components/LanguageSwitcher.tsx`
- `components/MarketDepartments.tsx`
- `components/MarketIcon.tsx`
- `components/MobileLanguageSwitcher.tsx`
- `components/Navbar.tsx`
- `components/NavbarWrapper.tsx`
- `components/OrderTimeline.tsx`
- `components/ProductBenefits.tsx`
- `components/ProductCard.tsx`
- `components/ProductFilters.tsx`
- `components/ProductGallery.tsx`
- `components/ProductOrderForm.tsx`
- `components/ProductTabs.tsx`
- `components/QuickView.tsx`
- `components/QuietTransition.tsx`
- `components/RelatedProducts.tsx`
- `components/Reveal.tsx`
- `components/StorefrontRouteTransition.tsx`
- `components/ToastProvider.tsx`
- `components/WishlistPageClient.tsx`
- `components/admin/AdminLogo.tsx`
- `components/admin/AdminTopbar.tsx`
- `components/admin/CategoryCreateModal.tsx`
- `components/admin/ChartsSection.tsx`
- `components/admin/EditProductForm.tsx`
- `components/admin/ImageUploader.tsx`
- `components/admin/InvoicePanel.tsx`
- `components/admin/KpiCards.tsx`
- `components/admin/NotificationBell.tsx`
- `components/admin/OrderStatusWorkflow.tsx`
- `components/admin/ProductForm.tsx`
- `components/admin/ProductHistory.tsx`
- `components/admin/QuickActions.tsx`
- `components/admin/Sidebar.tsx`
- `components/admin/SingleImageUploader.tsx`
- `components/admin/VariantManager.tsx`
- `components/admin/charts/CollectionSalesChart.tsx`
- `components/admin/charts/MonthlyRevenueChart.tsx`
- `components/admin/charts/OrdersChart.tsx`
- `components/admin/charts/RevenueChart.tsx`
- `components/admin/charts/TopProductsChart.tsx`
- `components/admin/dashboard/AnalyticsSection.tsx`
- `components/admin/dashboard/DashboardHeader.tsx`
- `components/admin/dashboard/KpiGrid.tsx`
- `components/admin/dashboard/OrdersActivity.tsx`
- `components/admin/dashboard/QuickActions.tsx`
- `components/admin/dashboard/ShowcaseHealth.tsx`
- `components/admin/dashboard/StatusHighlights.tsx`
- `components/admin/dashboard/ui.tsx`
- `components/cart-context.tsx`
- `components/customer/InvoiceDownload.tsx`
- `components/motion/DepthTilt.tsx`
- `components/motion/FadeIn.tsx`
- `components/motion/Reveal.tsx`
- `components/motion/ScaleIn.tsx`
- `components/motion/SlideUp.tsx`
- `components/motion/StaggerContainer.tsx`
- `components/skeletons/AdminDashboardSkeleton.tsx`
- `components/skeletons/CartDrawerSkeleton.tsx`
- `components/skeletons/ProductCardSkeleton.tsx`
- `components/skeletons/ProductDetailSkeleton.tsx`
- `hooks/useReducedMotion.ts`
- `hooks/useTranslation.ts`
- `lib/db.ts`
- `lib/landing-copy.ts`
- `lib/landing-text.ts`
- `lib/storefront-ui-copy.ts`
- `scripts/db-start.sh`
- `scripts/run-local-db-command.sh`
- `scripts/storefront-interaction-qa.cjs`
- `scripts/storefront-visual-qa.cjs`
- `tailwind.config.ts`
- `tests/unit/landing-legacy-images.test.ts`
- `tests/unit/landing-text.test.ts`
- `tests/unit/local-db-command.test.ts`

- `scripts/storefront-buying-qa.cjs`
