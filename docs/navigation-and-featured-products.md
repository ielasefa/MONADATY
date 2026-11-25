# Navigation and homepage product selection

The public header now keeps the rounded sticky frame, logo, compact search icon, favorites, language selector and cart. The long search field has been removed and the desktop navigation occupies its place between the logo and actions in a single row. The admin sign-in link and announcement ribbon have been removed. Category links live in one disclosure that supports hover, click, touch, ArrowDown, Escape and outside clicks. A click pins the disclosure open, preventing a hover transition from immediately closing it.

After scrolling, the header uses an 82% white surface with a 20px backdrop blur, a softer border and a light shadow. Its controls keep their opacity and the frame retains its height. The blur lives on a separate background layer so the quick-search overlay still covers the viewport. Mobile keeps the compact search icon and menu button; the cart label appears when there is enough room on desktop. Anchor offsets match the shorter header.

The homepage displays four category cards in a balanced grid. All populated categories remain reachable from the category disclosure and the complete catalogue. Popular products use four columns on desktop and two on mobile, with a maximum of four CMS-selected products. The admin owns the complete selection and ordering; the storefront never fills an empty slot automatically.

The existing local database uses the earlier landing-section storage. The admin landing route now provides a four-slot editor for that database. Saving requires four distinct, available catalogue products and replaces the ordered selection atomically. The protected API retains origin checks and authentication, handles concurrent-save conflicts, and invalidates the homepage cache after a successful save. Databases with the versioned CMS retain that editor and saving workflow. No schema migration or changes to product prices or stock were needed. Session signing, password hashing and permissions remain in place.

Navigation, selection feedback, category/filter labels and quick-search defaults support French, English and Arabic. Known generic category names are localized for presentation; their stored names and filter identifiers are preserved.

## Selecting the four products

1. Open `/admin/landing` and sign in if needed.
2. Choose a different product in each of the four slots.
3. Save the selection. Slot order controls the homepage order.

Existing selections remain in place until the admin saves all four slots. An incomplete selection is never supplemented automatically; the admin chooses all four products.

## Admin sign-in repair

The sign-in page now uses the burgundy/white/gold design, responsive typography and French/English/Arabic copy. Errors appear next to the form, and password-manager values are read from the submitted fields. After a successful sign-in, the browser confirms its signed cookie with a minimal no-cache session endpoint before navigating. Valid existing sessions open the admin directly; login-page self-redirects are normalized to the dashboard.

The reported Forbidden response was reproduced on local development addresses. Next may choose another port and canonicalize a loopback IP to localhost internally. Development requests now accept the matching local/private browser Host on the same server port. Production retains the explicit configured origin allowlist. The dashboard's expected missing-table fallback no longer reports a server error for the earlier showcase schema; unexpected database failures are still logged.

Existing account credentials were retained. Browser authentication and product-selection writes were tested against an isolated database copy.

## Validation

- Production build, TypeScript and lint passed. All 230 unit/integration tests across 29 files passed, including origin validation, session confirmation, redirect safety and four-product persistence.
- All three public Playwright regression tests passed, including navigation from the admin login to the storefront.
- Browser checks covered the homepage, admin selection and admin login in French, English and Arabic at 360, 390, 768, 1024, 1440 and 1920 pixels: 54 route/language/viewport combinations without horizontal overflow. Twelve axe-core scans reported no automated violations.
- Twelve interaction checks passed: actual form sign-in and retained session cookie, requested-page and authenticated redirects, rejected incomplete selection, four-product save/reload/order, category hover/click/keyboard/mobile navigation, sticky positioning, RTL, quick search, localized login errors and password visibility. No unexpected browser errors were recorded.
- The development Forbidden response was reproduced and verified fixed on alternate local ports and loopback aliases. Requests from untrusted origins remain rejected. Authentication and selection mutations used an isolated database copy; existing owner credentials and homepage selection were retained.
- After removing the disposable test database and build, the owner's development server remained running on port 3000. The homepage and login returned 200; an unauthenticated request to the selection editor redirected to login with the correct return URL. TypeScript also passed after restoring the default generated-type paths.

Results are recorded in [checks.json](../visual-qa/navigation/checks.json), with command output in [logs](../visual-qa/navigation/logs/). These checks do not claim full manual accessibility certification or validation of unrelated administrative and ordering workflows.

The subsequent single-row header refinement passed TypeScript and the three public Playwright regressions. Read-only browser checks covered French, English and Arabic at 320, 360, 390, 768, 1024, 1280, 1440 and 1920 pixels: 24 combinations with no horizontal overflow or overlapping header regions. Checks exercised mobile/desktop category disclosure, scrolling, the translucent surface and the full-viewport search overlay. Three header axe-core scans reported no automated violations, with no browser errors. See [the compact-header results and screenshots](../visual-qa/compact-header/).

Screenshots are in [visual-qa/navigation](../visual-qa/navigation/). These screenshots use an isolated copy of the local database, where the test admin changes the selection. They do not describe an automatically modified production selection.

The production build can use `MONADATY_BUILD_DIR=.next-navigation-qa` to keep its artifacts separate from a running development server. The normal build and development commands continue to use `.next`.
