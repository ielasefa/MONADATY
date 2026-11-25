# Administration design refinement

The administration now shares the storefront’s burgundy, champagne gold, warm white and Inter/Playfair typography. The public storefront and the administration remain separately scoped.

## Shared interface

- The sidebar uses deep burgundy, a gold brand mark and clear white active states. It retains the database-controlled menu and role restrictions. Desktop uses an inset rounded frame, tablets use an icon rail, and phones use a keyboard-accessible drawer with Escape, focus return and scroll restoration.
- The floating white topbar shows the current section, notifications and language selection. The storefront remains reachable from the sidebar.
- `app/admin.css` defines the shared administration palette, page spacing, cards, headings, fields, focus states, buttons, tables, dialogs and status colors. Legacy dark utility classes in administration routes and components now use semantic colors. Media overlays and inverse brand surfaces retain suitable contrast.
- The dashboard has a burgundy welcome panel, responsive metric cards, light analytics panels and readable small-value chart axes. Recent orders rearrange their customer, status and total on phones.
- Product and order management, customers, categories, collections, homepage content, settings, administrator management, invoices, reports, inventory, security, automation and articles use the same surfaces and controls. Translation and automation toolbars wrap on small screens. Article forms stack their fields on phones.

## Languages and content

French, English and Arabic use the existing locale context and logical directional spacing. The topbar includes language switching, Arabic uses Noto Sans Arabic and localized dashboard dates use Africa/Casablanca.

The existing translation seed supplies bundled administration defaults through `lib/admin-copy.generated.json`. Run `node scripts/generate-admin-copy.cjs` after updating that seed. `lib/admin-ui-copy.ts` supplies the additional shared interface labels. Nonempty CMS translations take precedence; empty or absent language values use the defaults. Public and custom translation namespaces keep their existing behavior. Catalogue names and authored content remain database values.

## Verification

- Production build, lint and TypeScript validation passed. All 235 unit/integration tests across 30 files passed, including CMS translation precedence, per-language defaults and database-failure behavior.
- Browser layout verification covered all 42 administration routes available in the test dataset in French, with the 17 core routes also checked in English and Arabic at 360, 390, 768 and 1440 pixels. Focused invoice-detail checks in all three languages bring the recorded total to 312 route/language/viewport combinations. All returned 200 without horizontal overflow, unexpected browser errors or untranslated interface keys.
- Twenty interaction checks covered real browser authentication, language switching and RTL changes, mobile navigation and focus return, product search, category forms, translation creation/edit panels, article forms, automation logs, Arabic chart-label placement and international phone-number reading direction. Editing panels were exercised without submitting business changes.
- Twenty-four axe-core scans of representative pages and open editing/navigation states reported no automated violations. Screenshots were also visually inspected. These checks do not constitute full manual accessibility certification.
- All three existing public Playwright regression tests passed against the owner's development server. Administration checks ran against the isolated production build and test database; the public image tests use the owner's existing legacy homepage data because synchronizing the disposable test schema enables the newer CMS storage.

See [the recorded checks](../visual-qa/admin-redesign/checks.json), [screenshots](../visual-qa/admin-redesign/) and [command logs](../visual-qa/admin-redesign/logs/). The earlier check record is retained alongside the final results; focused retests verify the final invoice-label and keyboard fixes.

Authentication, screenshots and populated chart/table states use a disposable database copy. Synthetic orders, a customer, an invoice and inventory records are confined to that copy. Schema synchronization was also confined to the test copy. No owner account, catalogue, prices, stock, order or homepage selection was changed by the visual verification. The test server, database and build are removed after verification.

The checks cover presentation and the documented interactions. They do not certify every operational, destructive, upload, payment or invoice-generation workflow. Screenshot content includes synthetic QA activity and does not represent the owner’s sales.

Cleanup confirmed that the original admin session and four-product homepage selection still matched their pre-test values. The owner's server remained on port 3000: the storefront and sign-in returned 200, and an unauthenticated dashboard request redirected to sign-in with the correct return URL. TypeScript passed after restoring the normal generated-type paths and removing the disposable build.
