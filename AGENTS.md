# MONADATY — Engineering Standards & Agent Conventions

This file defines the working standards for all AI and human contributors to the MONADATY repository. Follow these rules when reading, editing, or adding code.

---

## 1. Project Overview

MONADATY is a Moroccan premium beverage e-commerce platform. The codebase is split into:

- **Customer-facing storefront** (`app/` root) — public pages, shop, checkout, wishlist, login
- **Admin panel** (`app/admin/`) — authenticated dashboard for managing products, orders, customers, inventory, and site content

The brand visual language is: soft black, white, champagne gold, premium burgundy, and deep burgundy. All UI changes must preserve this identity.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + CSS custom properties in `app/globals.css` |
| Database | PostgreSQL via Prisma ORM (Pg/PGlite) |
| Auth | Server-side session + bcrypt |
| i18n | Custom `LanguageContext` + database-backed translations (`lib/translations.ts`) |
| UI libraries | Framer Motion, Sonner (toasts), React PDF, Recharts |
| Validation | Zod / manual inline validation |

---

## 3. Folder Structure Conventions

```
app/
  layout.tsx          — Root layout (providers, skip-link, theme color)
  page.tsx            — Homepage
  globals.css         — Global styles, design tokens, component classes
  [feature]/page.tsx  — Server components (fetch data, render markup)
  [feature]/loading.tsx / error.tsx — Loading / error boundaries

  admin/
    layout.tsx        — Admin shell (sidebar + top bar)
    [section]/page.tsx — Admin pages (server components)
    [section]/[id]/page.tsx — Detail pages

components/
  *.tsx               — Shared customer-facing components
  admin/
    *.tsx             — Shared admin components

lib/
  db.ts               — Database query helpers (customer)
  prisma.ts           — Prisma client singleton
  auth.ts             — Auth helpers (customer + admin)
  translations.ts     — i18n loader utilities
  [domain].ts         — Domain logic (orders, inventory, reports, etc.)

context/
  LanguageContext.tsx  — i18n runtime provider
hooks/
  useTranslation.ts   — Translation hook wrapper
types/
  index.ts            — Shared TypeScript types
prisma/
  schema.prisma       — Database schema
  seed.ts             — Seed script
public/
  [assets]            — Static assets
```

**Rules:**
- Server components live in `app/` and fetch directly from `lib/db.ts` or `lib/[domain].ts`.
- Client components are marked `"use client"` and live in `components/` or colocated with `page.tsx`.
- Do not nest client components inside server components without a boundary.
- Admin and customer code must not be mixed in the same component file.

---

## 4. Component Conventions

### General
- Components use PascalCase filenames.
- Export components as named exports unless they are page wrappers.
- Keep components focused: one responsibility per file.
- Use TypeScript interfaces/types for all props; avoid `any`.
- Destructure props at the top of the function signature.

### Server vs Client
- Default to **Server Components** (no `"use client"`).
- Add `"use client"` only when using: state, effects, browser APIs, event handlers, context consumers, framer-motion, sonner.
- Data fetching belongs in server components. Pass data down via props.

### Client Components
```tsx
"use client";

import { useState } from "react";
// imports...

type Props = {
  // typed props
};

export function ComponentName({ prop1, prop2 }: Props) {
  // implementation
}
```

### Admin Components
- All admin pages are client components (admin layout is a React Client Component).
- Admin forms use `input-premium` class (see §5).
- Admin colors use `bg-[#171717]` and `bg-surface` (no `bg-black`, no `#0A0A0A`, no `#141414`).
- Admin focus colors use `gold` / `burgundy` (never `yellow`, `red`, or `rouge`).

### Page Structure
```tsx
// app/[page]/page.tsx  (server component)
export default async function Page() {
  const lang = await getLanguage();
  const translations = await loadTranslations("namespace");
  const data = await fetchData();

  return (
    <div className="bg-[#171717]">
      {/* page content */}
    </div>
  );
}
```

---

## 5. Styling Conventions

### 5.1 CSS Architecture
- `app/globals.css`: global resets, CSS custom properties, reusable component classes (`.btn-primary`, `.btn-gold`, `.l-input`, `.input-premium`, `.luxury-card`, `.label-utility`, `.glass`, etc.)
- Page-level styles: Tailwind utility classes inline in JSX.
- Component-level styles: Tailwind utility classes inline in JSX.
- No new CSS files. No `@import` in components. No global class pollution.

### 5.2 Color Tokens

Use **only** these colors. Introduce no new grays, reds, purples, oranges, blues, or greens except for functional status states.

| Token | Value | Usage |
|---|---|---|
| Background / Soft Black | `#171717` | Default background on all customer and admin surfaces |
| White | `#FFFFFF` | Primary text, icons, dividers |
| Premium Burgundy | `#9B2638` | Primary CTA backgrounds, active states, badges |
| Deep Burgundy | `#741A28` | Hover states for burgundy elements |
| Champagne Gold | `#C8A96A` | Prices, accents, borders, active nav indicators, hover states, labels |

**Tailwind aliases (use these, do not hardcode hex values in JSX unless unavoidable):**

```css
/* In globals.css :root and tailwind.config.ts */
--bg: #171717;
--surface: #1E1E1E;
--card: #252525;
--gold: #C8A96A;
--gold-light: #D4BC7E;
--gold-dark: #A88A4A;
--rouge: #9B2638;
--rouge-dark: #741A28;
--black: #171717;
--ivory: #F8F6F2;
--muted: #7A7670;
```

**Tailwind class usage:**
- `bg-[#171717]`, `bg-black` → both resolve to `#171717`. Prefer `bg-[#171717]` on customer pages for brand clarity.
- `bg-surface` → `#1E1E1E` (admin panels, elevated surfaces)
- `text-white` / `text-ivory` → `#FFFFFF` / `#F8F6F2`. Prefer `text-white` for primary readability.
- `text-gold` → `#C8A96A` (prices, accents, active states)
- `bg-burgundy` / `bg-rouge` → `#9B2638`
- `bg-burgundy-dark` / `bg-rouge-dark` → `#741A28`
- `border-white/[0.06]` → subtle borders (do not use stronger borders unless intentional)

**Prohibited:**
- `bg-gray-*`, `text-gray-*`, `bg-slate-*`, `text-slate-*`
- `#0A0A0A`, `#0B0B0A`, `#141414`, `#1c1c1b`, `#1C1C1B`, `#252525` as hardcoded hex in JSX
- `text-red-*`, `text-yellow-*`, `bg-red-*`, `bg-yellow-*` in admin or customer UI

### 5.3 Input Styling

Two canonical input classes, defined in `app/globals.css`:

```css
/* Underlined input — used in checkout, hero forms */
.l-input {
  @apply h-11 w-full border-0 border-b border-white/[0.1] bg-transparent px-0
         text-[0.85rem] text-white outline-none transition-all duration-200
         focus:border-gold/50;
  &::placeholder { color: rgba(255,255,255,0.25); }
}

/* Filled input — used in admin forms, search bars */
.input-premium {
  @apply h-12 w-full rounded-input border border-white/[0.06] bg-[#1E1E1E] px-4
         text-sm text-white outline-none transition-all duration-200
         placeholder:text-white/35 focus:border-gold/50 focus:ring-1 focus:ring-gold/20;
}
```

**Critical email/text visibility rules:**
- `color: #FFFFFF` via `text-white` class or `style={{ color: "#FFFFFF" }}`
- `caret-color: #FFFFFF` so the typing cursor is visible
- `-webkit-text-fill-color: #FFFFFF` via inline style to defeat browser autofill override
- `background-color: #1E1E1E` for autofill background (declared in `globals.css`)
- Placeholder: `placeholder:text-white/35` to `placeholder:text-white/50` (never below 35)
- Never use `opacity` on an input parent that would dim typed text

### 5.4 Button Classes

Use the canonical classes from `app/globals.css`:

| Class | Usage |
|---|---|
| `.btn-primary` | Primary CTAs, login buttons, admin actions |
| `.btn-primary-sm` | Compact product cards, mobile CTAs |
| `.btn-secondary` | Outline gold buttons |
| `.btn-gold` | Solid gold variant (use sparingly) |
| `.btn-link` | Text links with tracking |

**Overrides:** If a button needs sizing, use `h-12`, `px-7`, `text-sm` etc. on top of the base class. Do not redefine button styles inline.

### 5.5 Spacing and Layout
- Container: `max-w-[1400px] px-6 md:px-10 lg:px-16` (desktop), `max-w-7xl` (admin)
- Editorial pages use `max-w-[1600px]` for hero sections, then `max-w-[1400px]` for content.
- Grid gaps: `gap-4` (mobile), `gap-5` (tablet), `gap-6` (desktop), `gap-8` (large).
- Vertical rhythm: section padding `py-16 md:py-20 lg:py-24`.

### 5.6 Hover and Transitions
- Duration: `duration-200` (fast), `duration-300` (standard), `duration-500` (slow page transitions).
- Easing: use default or `ease-premium` (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Hover lift: `hover:translate-y-[-1px]` paired with `active:translate-y-0`.

---

## 6. Typography Conventions

### 6.1 Font Families
- **DM Serif Display** (`font-display`): headings, editorial statements, product names, prices, brand moments.
- **DM Sans** (`font-body`): body text, labels, buttons, form inputs, UI chrome.

Global assignment is in `app/layout.tsx`. Components use `font-display` and `font-body` utility classes.

### 6.2 Hierarchy

| Level | Size | Weight | Tracking | Color | Line Height |
|---|---|---|---|---|---|
| Page title | `text-[clamp(2.5rem,6.5vw,6.5rem)]` | 400 (regular) | `-0.05em` | `text-white` | `0.85` |
| Section title | `text-[clamp(1.75rem,3.5vw,2.5rem)]` | 400/500 | `-0.03em` | `text-white` | `0.95` |
| Subsection title | `text-2xl` | 500 | `-0.02em` | `text-white` | `0.95` |
| Body text | `text-[0.85rem]` to `text-[0.92rem]` | 400 | normal | `text-white/55` to `text-white/80` | `1.7` to `2` |
| Label / eyebrow | `text-[0.42rem]` (`.label-utility`) | 600 | `0.4em` | `text-gold/60` | normal |
| Small metadata | `text-[0.6rem]` to `text-[0.65rem]` | 500 | `0.15em` | `text-white/30` to `text-white/60` | normal |

**Rules:**
- Never exceed `text-white/25` for body copy. Use `text-white/35` minimum for readable paragraphs.
- Prices use `font-display text-base font-light tracking-wide text-gold`.
- Editorial background numbers (watermarks) use `text-white/[0.04]` to `text-white/[0.06]`.
- Button labels: `text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white`.

---

## 7. Accessibility Requirements

- All interactive elements must have visible focus indicators (`focus-visible:ring-*`).
- Global focus ring defined in `globals.css`: `outline: 2px solid rgba(200,169,106,0.5)`.
- All images must have meaningful `alt` text. Decorative images use `alt=""` with `aria-hidden="true"`.
- Form inputs must have associated `<label>` elements (or `aria-label` for icon-only inputs).
- Icon-only buttons must have `aria-label`.
- Modal and drawer elements must set `role="dialog"`, `aria-modal="true"`, and a descriptive `aria-labelledby` or `aria-label`.
- Escape key must close dropdowns, drawers, and mobile menus.
- Mobile menu must trap focus when open and restore focus on close.
- Skip-to-content link is present in `app/layout.tsx`. Do not remove it.
- Color contrast: never rely on color alone to convey state (add icons or text labels).
- Announce dynamic content changes (toasts use `sonner`, which is accessible by default).

---

## 8. Responsive Requirements

Breakpoints (Tailwind):

| Token | Width |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

**Audit all layout changes at:** `375px`, `390px`, `430px`, `768px`, `1024px`, `1280px`, `1440px`, `1920px`.

**Rules:**
- Product grids: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- Text must not overflow or clip at any breakpoint. Use `truncate` or responsive font sizes (`clamp()`).
- Navigation collapses to hamburger at `lg:hidden`.
- Touch targets: minimum `44×44px` equivalent for mobile.
- Horizontal scroll is forbidden on customer-facing pages.
- Admin sidebar is fixed at `w-64`; main content adjusts with `flex-1`.

---

## 9. i18n and RTL Rules

- All user-facing strings use the `useTranslation` hook.
- Admin strings use `useTranslation("admin")` or the relevant namespace.
- **Never hardcode** English strings in JSX markup. Use `t("key", "fallback")` with a descriptive fallback.
- New translation keys must be seeded via `prisma/seed-translations.ts`.
- RTL is handled via the `<html dir>` attribute set from `LanguageContext`.
- Use logical Tailwind properties: `start` / `end`, `ms-*` / `me-*`, `ps-*` / `pe-*`, `border-s-*` / `border-e-*`.
- Arrow icons use `rtl:rotate-180` for direction.
- Do not use `left` / `right` in absolute positioning unless the element is inside an LTR-only container with explicit direction handling.

---

## 10. Security Rules

### 10.1 Secrets and Environment Variables
- **Never** expose API keys, database URLs, or secrets in client-side code.
- All secrets are loaded server-side via `process.env` validated by `lib/env-validator.ts`.
- Client components must not import modules that read `process.env` directly for sensitive values.
- Use Next.js server-side `cookies()`, `headers()`, and `searchParams` in server components only.

### 10.2 Output and XSS
- **Never** use `dangerouslySetInnerHTML` on untrusted content.
- If HTML rendering is required (admin rich text), sanitize server-side before storage. Client rendering must strip all tags or use a sanitized view.
- Admin input fields that store HTML must validate and escape on write.

### 10.3 Input Validation
- All form inputs must be validated server-side before database writes.
- Use Zod schemas for complex validation where practical.
- Never trust client-side validation alone.

### 10.4 Authentication and Authorization
- Customer routes are protected via server-side checks in `lib/auth.ts`.
- Admin routes are protected by `app/admin/layout.tsx` using `isAuthenticated()`.
- API routes handling mutations must verify the admin session and return `401` / `403` on failure.
- Rate limiting is implemented in `lib/rate-limiter.ts`. Do not bypass rate limits in new endpoints.

### 10.5 CSRF
- State-changing API routes must validate CSRF tokens where applicable (`lib/csrf.ts`).

---

## 11. Database and Prisma Rules

- Prisma schema lives at `prisma/schema.prisma`.
- Database access in server components uses `lib/db.ts` or direct `prisma` import via `lib/prisma.ts`.
- **Never** access Prisma from client components. All data fetching must be server-side.
- Use parameterized queries (Prisma handles this automatically). Never concatenate raw SQL.
- Seed translations via `prisma/seed-translations.ts`. Do not insert translation records from UI forms.
- Migration files: name with timestamp and description (e.g., `20240101_add_orders_table`).
- After schema changes: run `npm run db:generate` and `npm run db:push` (or migrate) in development.
- **Never** modify database records to fix a visual bug.

---

## 12. API and Server Action Rules

- API routes live in `app/api/`. Route handlers use `export async function GET/POST/PUT/DELETE(request)`.
- All non-GET API routes must verify authentication and authorization before processing.
- Return structured JSON: `{ data, error, meta }` or Next.js `NextResponse.json()` with appropriate status codes.
- Use `Response.json()` (Next.js 15) pattern. Do not use legacy `res.status().json()`.
- Error messages must not leak internal details (stack traces, SQL, file paths) to the client.
- Server Actions (if used) must also validate input and check auth.

---

## 13. Cart / Wishlist / Checkout Preservation Rules

These systems are business-critical. Treat them with strict care.

- **Do not refactor** cart, wishlist, or checkout logic without explicit instruction.
- **Do not rename** context keys, state fields, or database columns used by these systems.
- Cart and wishlist state lives in `components/cart-context.tsx` and `components/wishlist-context.tsx`. Both are client components.
- Product add-to-cart calls use `addItem(cartProduct, 1)`. Preserve this signature.
- Checkout flow lives in `components/CheckoutFlow.tsx`. Modify only styling unless requested.
- Order creation goes through `lib/orders.ts`. Preserve the existing function signatures.
- **Do not replace real functionality with mock data** to solve UI problems.

---

## 14. Admin Area Rules

- Admin layout is `app/admin/layout.tsx`. All admin pages require authentication.
- Admin colors: use `bg-[#171717]` for backgrounds, never `#0A0A0A`, `#141414`, or `#1c1c1b`.
- Admin forms use `.input-premium` (defined in `globals.css`). Do not redefine admin input styles inline.
- Admin focus colors: use `focus:border-gold/40` and `focus:ring-gold/20`. Never `focus:border-yellow`, `focus:border-red`, or `focus:border-rouge`.
- Admin buttons use `.btn-primary`, `.btn-secondary`, `.btn-link`. Do not introduce new button styles.
- Admin pages share a sidebar (`components/admin/Sidebar.tsx`) and top bar. Preserve this layout.
- Admin logs (`lib/audit.ts`), notifications (`lib/admin-notifications.ts`), and API keys (`lib/api-keys.ts`) must remain functional.
- Admin management of admins, products, orders, customers, inventory, and settings must not break existing permissions.

---

## 15. Build Requirements

Before considering any task complete:

```bash
npm run db:start   # ensure database is running (handled by npm run build)
npm run typecheck  # must pass with zero errors
npm run lint       # must pass with zero errors
npm run build      # must succeed with zero errors
```

- Fix all TypeScript errors before committing. Do not use `@ts-ignore` or `@ts-expect-error` without a linked issue.
- Fix all ESLint errors. Warnings should be resolved unless explicitly approved.
- Build must produce a valid production bundle. Inspect build output for unexpected warnings.
- Do not claim a fix is complete based solely on code compilation. Verify the affected pages render correctly.

---

## 16. Git and Commit Conventions

- Commit messages follow conventional commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`, `test:`.
- Scope is optional but encouraged: `feat(shop):`, `fix(admin):`, `style(globals):`.
- One logical change per commit.
- Never commit secrets, `.env` files, or database dumps.
- Check `git status` and `git diff` before committing. Stage only intended files.
- Do not amend or force-push without explicit instruction.

---

## 17. Code Review Checklist

Run this checklist before requesting review or completing a task:

- [ ] **Typecheck passes:** `npm run typecheck` returns zero errors
- [ ] **Lint passes:** `npm run lint` returns zero errors
- [ ] **Build passes:** `npm run build` succeeds
- [ ] **No hardcoded strings:** All user-facing text uses `useTranslation`
- [ ] **Color compliance:** Uses only `#171717`, `#FFFFFF`, `#C8A96A`, `#9B2638`, `#741A28` (plus approved `#1E1E1E`, `#252525`, `#F8F6F2`, `#7A7670` tokens)
- [ ] **No prohibited hex values:** No `#0A0A0A`, `#141414`, `#1c1c1b`, `#252525` hardcoded in JSX (use tokens)
- [ ] **Input visibility:** All email/text inputs have `text-white` or equivalent, `caretColor: #FFFFFF`, and `-webkit-text-fill-color: #FFFFFF` via style
- [ ] **Autofill handled:** `app/globals.css` contains `-webkit-autofill` rules; inputs do not fight autofill visibility
- [ ] **No `dangerouslySetInnerHTML`** unless explicitly required and sanitized
- [ ] **No secrets in client code:** No `process.env` access in components with `"use client"`
- [ ] **No SQL concatenation:** All queries use Prisma parameterized methods
- [ ] **RTL safe:** No hardcoded `left` / `right` in shared components; uses logical properties or `rtl:` variants
- [ ] **Accessibility:** Focus rings present, labels present, aria-labels on icon buttons, images have alt text
- [ ] **Responsive:** Layout tested at key breakpoints; no horizontal overflow
- [ ] **Cart/wishlist/checkout preserved:** No changes to cart context, wishlist context, or checkout flow unless explicitly requested
- [ ] **i18n:** New strings include EN, FR, AR fallbacks at minimum (seed via `seed-translations.ts`)
- [ ] **Admin area:** Uses `bg-[#171717]`, `.input-premium`, `focus:border-gold`, `.btn-primary`, `.btn-secondary`
- [ ] **No duplicate components:** Fixes target the existing component rather than creating a wrapper

---

## 18. Definition of Done

A task is considered complete only when **all** of the following are true:

1. The code change is minimal and targeted. No unnecessary files added.
2. The affected pages render correctly with consistent MONADATY branding.
3. `npm run typecheck` passes with zero errors.
4. `npm run lint` passes with zero errors.
5. `npm run build` succeeds.
6. No customer-facing functionality (cart, wishlist, checkout, orders, auth, i18n, search, filters) is broken.
7. No secrets or credentials are exposed or logged.
8. Accessibility requirements (focus rings, labels, aria) are not degraded.
9. RTL layout is not broken for Arabic pages.
10. A summary of changes is provided covering: files modified, root cause of any fixed bug, and any remaining risks.

---

*End of AGENTS.md*
