"use client";

import { categoryLabel } from "@/lib/category-label";
import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { CommandPalette } from "@/components/CommandPalette";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileLanguageSwitcher } from "@/components/MobileLanguageSwitcher";
import { MarketIcon } from "@/components/MarketIcon";
import { useTranslation } from "@/hooks/useTranslation";
import type { Language } from "@/context/LanguageContext";

type Category = { slug: string; name: string };
const copy = {
  fr: { home: "Accueil", shop: "Catalogue", categories: "Catégories", all: "Toutes les boissons", collections: "Collections", about: "À propos", search: "Rechercher une boisson ou une marque", menu: "Ouvrir le menu", close: "Fermer le menu", quickSearch: "Recherche rapide", wishlist: "Favoris", cart: "Panier", primary: "Navigation principale", brand: "ELASRI BUSINESS" },
  en: { home: "Home", shop: "Catalogue", categories: "Categories", all: "All beverages", collections: "Collections", about: "About", search: "Search drinks or brands", menu: "Open menu", close: "Close menu", quickSearch: "Quick search", wishlist: "Favorites", cart: "Cart", primary: "Main navigation", brand: "ELASRI BUSINESS" },
  ar: { home: "الرئيسية", shop: "الكتالوج", categories: "الفئات", all: "جميع المشروبات", collections: "المجموعات", about: "من نحن", search: "ابحث عن مشروب أو علامة تجارية", menu: "فتح القائمة", close: "إغلاق القائمة", quickSearch: "بحث سريع", wishlist: "المفضلة", cart: "السلة", primary: "التنقل الرئيسي", brand: "ELASRI BUSINESS" },
};

function Chevron({ open }: { open: boolean }) {
  return <svg aria-hidden="true" className={"h-4 w-4 shrink-0 transition-transform " + (open ? "rotate-180" : "")} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m5 7 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CategoryMenu({ categories, lang, mobile = false, onNavigate }: { categories: Category[]; lang: Language; mobile?: boolean; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pinned = useRef(false);
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const labels = copy[lang];
  const clearDelay = () => { if (delay.current) clearTimeout(delay.current); };
  const close = useCallback(() => { pinned.current = false; setOpen(false); }, []);

  useEffect(() => () => { if (delay.current) clearTimeout(delay.current); }, []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) close(); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ref.current?.getClientRects().length) { event.preventDefault(); event.stopPropagation(); close(); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape, true);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape, true); };
  }, [open, close]);

  function navigate() { clearDelay(); close(); onNavigate?.(); }

  return (
    <div ref={ref} className={"market-category-menu " + (mobile ? "market-category-menu-mobile" : "")}
      onMouseEnter={mobile ? undefined : () => { clearDelay(); delay.current = setTimeout(() => setOpen(true), 80); }}
      onMouseLeave={mobile ? undefined : () => { clearDelay(); if (!pinned.current) delay.current = setTimeout(close, 160); }}
      onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) close(); }}
    >
      <button ref={trigger} type="button" className="market-category-trigger" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => { clearDelay(); if (pinned.current) close(); else { pinned.current = true; setOpen(true); } }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault(); pinned.current = true; setOpen(true);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLAnchorElement>("[data-category-panel] a")?.focus());
          }
        }}
      >
        <MarketIcon name="box" /><span>{labels.categories}</span><Chevron open={open} />
      </button>
      {open && (
        <div id={id} data-category-panel className="market-category-dropdown">
          <Link href="/shop" className="market-category-all" onClick={navigate}>{labels.all}</Link>
          <ul className="market-category-options">
            {categories.map(category => (
              <li key={category.slug}><Link href={"/shop?category=" + encodeURIComponent(category.slug)} onClick={navigate}>{categoryLabel(category.name, lang)}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Navbar({ categories, websiteName, logoUrl }: { categories: Category[]; websiteName: string; logoUrl?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { lang } = useTranslation("navbar");
  const labels = copy[lang];
  const pathname = usePathname();
  const hamburger = useRef<HTMLButtonElement>(null);
  const mobileMenu = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const links = [
    { href: "/", label: labels.home },
    { href: "/shop", label: labels.shop },
    { href: "/collections", label: labels.collections },
    { href: "/about", label: labels.about },
  ];

  useEffect(() => setIsMenuOpen(false), [pathname]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 20);
    scroll(); window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    const command = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); setCmdOpen(value => !value); }
    };
    document.addEventListener("keydown", command);
    return () => document.removeEventListener("keydown", command);
  }, []);
  useEffect(() => {
    if (!isMenuOpen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mobileMenu.current?.querySelector<HTMLElement>("a,button")?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeMenu(); hamburger.current?.focus(); return; }
      if (event.key !== "Tab") return;
      const nodes = Array.from(mobileMenu.current?.querySelectorAll<HTMLElement>("a,button") || []);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!mobileMenu.current?.contains(target) && !hamburger.current?.contains(target)) closeMenu();
    };
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", outside);
    };
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="storefront-theme market-header z-50" data-scrolled={scrolled}>
      <div className="market-header-main market-container">
        <Link href="/" className="market-wordmark" aria-label={websiteName + " — " + labels.home}>
          {logoUrl ? (
            <Image src={logoUrl} alt="" width={220} height={80} unoptimized className="market-wordmark-image" />
          ) : (
            <>
              <svg width="56" height="25" viewBox="0 0 56 25" fill="none" aria-hidden="true">
                <defs><linearGradient id="market-wordmark-metal" x1="0" y1="0" x2="56" y2="25" gradientUnits="userSpaceOnUse"><stop stopColor="#8C6228" /><stop offset=".5" stopColor="#E8CD91" /><stop offset="1" stopColor="#8C6228" /></linearGradient></defs>
                <path d="M2 22C11 22 12 4 20 4s8 16 14 16S39 4 46 4s7 16 10 18" stroke="url(#market-wordmark-metal)" strokeWidth="6" />
              </svg>
              <span>{websiteName}</span><small>{labels.brand}</small>
            </>
          )}
        </Link>
        <nav aria-label={labels.primary} className="market-navigation">
          <ul className="market-navigation-links">
            {links.slice(0, 2).map(link => <li key={link.href}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}
            <li><CategoryMenu categories={categories} lang={lang} /></li>
            {links.slice(2).map(link => <li key={link.href}><Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}
          </ul>
        </nav>
        <div className="market-header-actions">
          <LanguageSwitcher className="market-language hidden lg:flex" />
          <button type="button" onClick={() => setCmdOpen(true)} className="market-quick-search inline-flex" aria-label={labels.quickSearch}><MarketIcon name="search" /></button>
          <Link href="/wishlist" aria-label={labels.wishlist + (wishlistCount ? " (" + wishlistCount + ")" : "")} className="market-wishlist-button relative hidden items-center justify-center rounded-lg lg:inline-flex">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill={wishlistCount ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" /></svg>
            {wishlistCount > 0 && <span className="absolute -end-1 -top-1 rounded-full px-1 text-xs">{wishlistCount}</span>}
          </Link>
          <button type="button" id="cart-button" onClick={toggleDrawer} className="market-cart-button relative" aria-label={labels.cart + (itemCount ? " (" + itemCount + ")" : "")}>
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h3l3 12h11l3-9H6 M9 20a1 1 0 1 0 2 0 1 1 0 0 0-2 0 M17 20a1 1 0 1 0 2 0 1 1 0 0 0-2 0" /></svg>
            <span className="market-cart-label hidden xl:inline">{labels.cart}</span>
            {itemCount > 0 && <span className="absolute -end-1 -top-1 rounded-full px-1 text-xs">{itemCount}</span>}
          </button>
          <button ref={hamburger} type="button" onClick={() => setIsMenuOpen(value => !value)} className="inline-flex items-center justify-center rounded-lg lg:hidden" aria-label={isMenuOpen ? labels.close : labels.menu} aria-expanded={isMenuOpen} aria-controls="mobile-menu">
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">{isMenuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div ref={mobileMenu} id="mobile-menu" className="bg-white p-4 lg:hidden">
          <nav aria-label={labels.primary} className="market-mobile-navigation">
            {links.slice(0, 2).map(link => <Link key={link.href} href={link.href} onClick={closeMenu} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
            <CategoryMenu categories={categories} lang={lang} mobile onNavigate={closeMenu} />
            {links.slice(2).map(link => <Link key={link.href} href={link.href} onClick={closeMenu} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
            <Link href="/wishlist" onClick={closeMenu}>{labels.wishlist}</Link>
          </nav>
          <div className="mt-4 border-t border-line pt-4"><MobileLanguageSwitcher onSelect={closeMenu} /></div>
        </div>
      )}
      <Suspense fallback={null}><CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} brandName={websiteName} /></Suspense>
    </header>
  );
}
