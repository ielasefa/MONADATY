# MONADATY storefront design system

## Foundations

- White is the default surface. Warm off-white `#FAF8F5` defines recessed fields and product media. Dividers use `#E8E1D8`.
- Burgundy `#780B10` identifies navigation and primary actions. Deep burgundy `#450407` anchors the hero and footer, and `#9B111E` is the primary hover color.
- The `--market-metal` gradient uses champagne highlights and darker gold edges. Use it for the main editorial action, badges, and small accents. Flat `#8C6228` provides contrast for small icons and focus rings.
- Playfair Display is used for selected editorial headings. Inter is used for product names, body text, navigation, controls and prices. Noto Sans Arabic provides Arabic text and headings, with natural tracking and expanded heading line height. Price figures use bold tabular numerals.
- `--market-gutter` scales from 16 to 64 pixels. The content shell caps at 1536 pixels. Hero panels use a 16-pixel radius, product cards use 14 pixels, category cards use 12 pixels, and buttons use 10 pixels. Shared shadows use a low-opacity burgundy tint.

## Surface and text colors

Use semantic Tailwind colors when composing the interface.

- `text-foreground` gives headings and product names their primary text color.
- `text-secondary` gives descriptions and labels an opaque, readable neutral color.
- `text-accent` uses dark gold on light surfaces and champagne on burgundy surfaces.
- `text-brand` identifies prices and commercial links.
- `bg-canvas`, `bg-surface`, `bg-card`, and `border-line` define the page, recessed areas, white cards, and dividers.

The hero, footer, and `market-image-caption` set an inverse text palette. Burgundy actions set a white foreground for their contents. Hover colors use explicit state classes. Product names and prices use Inter, while editorial headings use Playfair Display.

Primary, secondary, and gold controls have a minimum height of 44 pixels. Form inputs use 16-pixel text, and secondary actions use a burgundy border on a white background. Toasts use a white surface with dark text and a burgundy accent.

## Components

- `.market-header` provides sticky navigation in a floating frame with 20-pixel corners and a responsive inset from the viewport edges. Navigation groups categories in a single disclosure. Mobile exposes search and cart directly, with a scrollable menu positioned below the frame. Desktop product and checkout panels reserve space beneath the header when they stick during scrolling.
- `.market-section-heading` pairs an editorial title with an optional catalogue link. `.market-container` aligns these sections with the header and category grid.
- `.market-product` provides image, wishlist, actual merchandise badges, price and quantity controls. Stock and availability come from the product data. The existing cart provider applies quantity and availability checks.
- `.storefront-panel`, `.storefront-input`, `.storefront-empty`, and shared skeletons apply across the public catalogue and buying pages. `.market-auth-card` provides the sign-in and password-change surface.
- `.market-image-caption` maintains white text over dark photo overlays. Use meaningful alternative text for catalogue images and empty alternative text for decorative artwork.
- French, English and Arabic use the existing language context. Directional spacing uses logical properties and the desktop hero reverses its composition in RTL.

The catalogue drawer derives its brand and format options from product data and stores selections in the URL alongside category, price and sort. Formats describe the existing can, bottle and glass fields.

## Responsive behavior

- Below 640 pixels the landing page uses a stacked photo and headline, two-column cards and direct cart access.
- From 640 pixels the hero copy sits beside the beverage group and categories use three columns.
- From 1024 pixels the desktop category navigation and four-column category layout appear. Popular products use four desktop columns and two mobile columns, with all four positions selected by the admin.
- Motion is limited to hover, press, menu and existing page enter effects. Follow `prefers-reduced-motion` and retain visible focus indicators when adding interactions.

## Content and assets

The catalogue, category labels, prices, availability, collections and testimonials use the existing application data. The hero keeps its CMS media and destination link. The bundled WebP assets in `public/images/storefront/` are editorial category and hero fallbacks. They depict generic beverages and carry no item names, quantities, prices or commercial claims.

### Editorial artwork prompts

The built-in image generation tool was used for both assets. The files were resized and encoded as WebP.

- Hero prompt. “Photoreal B2B beverage wholesale website hero background, wide landscape. Use the user's reference image for visual direction: warm dark burgundy seamless studio background with a hint of elegant curved gold reflection and dramatic lighting, ice cubes at bottom, five chilled colorful unbranded cans and one blue capped water bottle tightly arranged on right, rich realistic condensation, left 48% quiet solid dark burgundy for web headline overlay. No words, no logos, no UI. Full bleed editorial beverage photography.”
- Category prompt. “Generate one photoreal editorial beverage category contact sheet for Monadaty: exactly FIVE equal-width vertical panels in a single horizontal strip, straight hard cuts at 20%, 40%, 60%, 80%, no gutters. Distinct full bleed photos in order from left: red cola can with condensation on dark red; clear water bottle with water splash on blue; orange juice in glass with orange wedges on orange; cobalt blue energy drink can with cold ice against dark navy; amber iced tea with ice in clear glass against copper. Frame the beverage subjects prominently in the middle of each panel, premium studio photography, no text, logos or lettering.” Each panel was exported as a separate image.


## File inventory

- Routes and shared styles: `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/collections/page.tsx`, `app/product/[id]/page.tsx`, `app/admin/login/page.tsx`, `app/admin/change-password/page.tsx`, `tailwind.config.ts`.
- Header, landing page, and footer: `components/Navbar.tsx`, `components/NavbarWrapper.tsx`, `components/CommandPalette.tsx`, `components/Hero.tsx`, `components/HomepageCommerce.tsx`, `components/MarketDepartments.tsx`, `components/MarketIcon.tsx`, `components/Footer.tsx`, `app/admin/landing/LandingForm.tsx`.
- Commerce: `components/CartDrawer.tsx`, `components/CheckoutFlow.tsx`, `components/CollectionCard.tsx`, `components/FilterSidebar.tsx`, `components/ProductCard.tsx`, `components/ProductFilters.tsx`, `components/ProductOrderForm.tsx`, `components/WishlistPageClient.tsx`.
- Assets: `wholesale-hero.webp`, `category-soda.webp`, `category-water.webp`, `category-juice.webp`, `category-energy.webp`, and `category-other.webp` in `public/images/storefront/`.


## Color refinement verification

The visual review covered the homepage, populated and empty catalogues, product detail, collections, favorites, about, checkout, confirmation, sign-in, offline, and error states. The browser checked each at 360, 390, 768, 1024, 1440, and 1920 pixels. The cart drawer and populated checkout were also inspected, with an additional Arabic RTL homepage capture.

All 72 viewport checks completed without horizontal overflow or browser console errors. Nine text contrast samples covering product names, prices, actions, selected categories, quantity controls, footer text and the gold action had a minimum ratio of 5.73 to 1. The review checked the public interface and cart interactions.

Lint, TypeScript, the production build and all 190 automated tests passed. Protected administration pages and live order submission require separate functional verification.

The color refinement also covers the public error and loading pages, `CheckoutClient`, `ProductGallery`, `ProductTabs`, `ProductBenefits`, `EmptyState`, `OrderTimeline`, language controls, toast notifications, and the customer invoice download panel. These components use the shared surface and foreground tokens.


## Refinement rules — 25 November 2026

- Content aligns to `--market-container` (1536px) and `--market-gutter`. Page sections use `--market-section-space` (48–80px). Product and category grids use 12/16/24px gaps. The floating header and hero retain their inset frames.
- Collection labels use an opaque white reading panel so HTML navigation never overlaps text embedded in authored brand artwork.
- Functional text starts at 14px, form entries use 16px, and metadata may use 12px. Product names use two fixed lines with 24px line height. Editorial headings scale from 28 to 56px. Avoid wide tracking on controls and disable tracking for Arabic.
- Public product cards share square media, contain authentic photography, and reserve an aligned action row with a 48px quantity input and flexible 44px action. The short visible action label has a full accessible product-specific name. Product skeletons mirror this geometry.
- On mobile, hero media has its own 200px region above the copy. Category filters scroll horizontally, leaving search and merchandise closer to the top. At tablet sizes the controls and product grid change composition rather than scaling desktop text down.
- Homepage and navigation feature categories and collections containing current catalogue products. The full collections page retains every database collection, with populated collections first and actual product counts.
- Footer links point to supported routes, current collections and the CMS contact address. Unsupported placeholder legal, journal and FAQ links have been removed.
- CMS media, CTA destinations, section order and enabled states remain authoritative. Custom hero text is visible. Known bundled English seed strings use localized B2B copy through `landingText`; new authored overrides render verbatim in all languages because the existing CMS has one text field per item. Brand story text also respects authored content. Testimonials render database text verbatim, without invented substitutions or inferred ratings.
- `STOREFRONT_UI_COPY` supplies missing functional translations. Existing translation CMS entries take precedence. Catalogue and checkout translations are included in the initial server payload.
- Motion preferences use an identical server/hydration snapshot. Images fade without moving their layout. The continuous eyebrow animation has been removed. Cart and filter dialogs support Escape, keyboard focus management and body-scroll restoration.
- Protected administration uses Inter, opaque secondary text, readable labels and 44px primary controls. Authentication, permissions, pricing, schema and order processing are unchanged by this refinement.

See [the refinement report](./storefront-refinement-report.md) for the route inventory, screenshots, validation results and verification limits.

Final refinement verification covered 168 viewport checks, 25 axe-core scans with no reported automated violations, 9 commerce checks, 3 public Playwright regression tests, and all 192 unit/integration tests. Lint, TypeScript and production build passed. See the report for precise scope and unverified authenticated/order flows.

## Compact navigation and four product slots

The header has no announcement ribbon or public administration entry. Its category disclosure contains all populated categories, with a two-column list, 44px targets, a white reading surface and restrained burgundy controls. Hover opens it temporarily; clicking pins it until the next click, Escape or an outside click. Mobile uses an inline disclosure within the scrollable navigation panel.

Desktop navigation now shares one row with the logo and actions, replacing the wide search field. Search remains available through a compact icon on all screen sizes. The rounded sticky frame changes to an 82% white, 20px blurred surface after scrolling, with fully opaque text and controls. Its background layer keeps viewport-sized overlays independent of the blur.

The homepage category grid now has four cards, arranged as two columns on mobile/tablet and four on desktop. Popular products use the same four/two column rhythm. Exactly four products are saved through the admin selection workflow; incomplete legacy selections remain unchanged until the admin fills all four slots. No substitute products are generated or added automatically.

See [navigation and product selection](./navigation-and-featured-products.md) for the editing workflow and current validation.

The admin sign-in uses the same warm white, burgundy and gold palette, with a spacious brand panel on desktop and a single form on mobile. Inputs use explicit labels and password-manager autocomplete; language, password visibility, submission feedback and errors support French, English and Arabic. A successful response is followed by session confirmation before navigation. The local-development origin fix preserves the production origin allowlist.

The protected administration now extends that visual language to its shared shell, dashboard, tables, forms, content editors and operational modules. Its burgundy sidebar and white rounded surfaces use a separate scoped stylesheet. See [the administration design report](./admin-design-system.md) for its coverage and validation.
