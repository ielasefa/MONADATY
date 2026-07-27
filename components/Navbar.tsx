"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { usePathname, useRouter } from "next/navigation";
import { CollectionCard } from "@/components/CollectionCard";
import { CommandPalette } from "@/components/CommandPalette";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileLanguageSwitcher } from "@/components/MobileLanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import type { CollectionData } from "@/types";

export function Navbar({
  collections,
  websiteName,
}: {
  collections: CollectionData[];
  websiteName: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, toggleDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);
  const isShopPage = pathname === "/shop";
  const isAdminPage = pathname.startsWith("/admin");

  const { t } = useTranslation("navbar");
  const { t: tCommon } = useTranslation("common");

  const collectionsRef = useRef<HTMLDivElement | null>(null);
  const collectionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);

  function clearTimeouts() {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  const openDropdown = useCallback(() => {
    clearTimeouts();
    setIsCollectionsOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    clearTimeouts();
    setIsCollectionsOpen(false);
  }, []);

  const openWithDelay = useCallback(() => {
    clearTimeouts();
    if (!isCollectionsOpen) {
      openTimeoutRef.current = setTimeout(openDropdown, 60);
    }
  }, [isCollectionsOpen, openDropdown]);

  const closeWithDelay = useCallback(() => {
    clearTimeouts();
    if (isCollectionsOpen) {
      closeTimeoutRef.current = setTimeout(closeDropdown, 150);
    }
  }, [isCollectionsOpen, closeDropdown]);

  useEffect(() => () => clearTimeouts(), []);

  useEffect(() => {
    if (!isCollectionsOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        collectionsRef.current &&
        !collectionsRef.current.contains(target) &&
        collectionsButtonRef.current &&
        !collectionsButtonRef.current.contains(target)
      ) {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollectionsOpen, closeDropdown]);

  useEffect(() => {
    if (!isCollectionsOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
        collectionsButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isCollectionsOpen, closeDropdown]);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen || !mobileMenuRef.current) return;
    const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [isMenuOpen]);

  useEffect(() => {
    function handleCmdK(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleCmdK);
    return () => document.removeEventListener("keydown", handleCmdK);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    setSearch("");
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "liquid-glass border-b border-ivory/[0.06]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[3.5rem] md:h-[4rem] items-center justify-between gap-6 max-w-[1600px] px-6 md:px-10 lg:px-16">
        <Link
          href="/"
          className="group shrink-0 font-display text-[0.8rem] font-normal uppercase tracking-[0.55em] text-ivory transition-colors duration-500 hover:text-ivory/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          aria-label={`${websiteName} — Home`}
        >
          <span>{websiteName}</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden lg:flex lg:flex-1 lg:justify-center"
        >
          <ul className="flex items-center gap-12 text-[0.52rem] font-medium uppercase tracking-[0.28em]">
            <li>
              <Link
                href="/"
                className={`relative py-2 transition-colors duration-300 hover:text-ivory focus-visible:text-ivory focus-visible:outline-none ${
                  pathname === "/" ? "text-ivory" : "text-ivory/35"
                }`}
              >
                {t("home")}
                {pathname === "/" && (
                  <span className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold" />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                className={`relative py-2 transition-colors duration-300 hover:text-ivory focus-visible:text-ivory focus-visible:outline-none ${
                  isShopPage ? "text-ivory" : "text-ivory/35"
                }`}
              >
                {t("shop")}
                {isShopPage && (
                  <span className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold" />
                )}
              </Link>
            </li>
            <li
              className="relative"
              onMouseEnter={openWithDelay}
              onMouseLeave={closeWithDelay}
            >
              <button
                ref={collectionsButtonRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isCollectionsOpen}
                aria-controls="collections-dropdown"
                onClick={() =>
                  isCollectionsOpen ? closeDropdown() : openDropdown()
                }
                onMouseEnter={openWithDelay}
                className={`relative inline-flex items-center gap-2 py-2 transition-colors duration-300 hover:text-ivory focus-visible:text-ivory focus-visible:outline-none ${
                  isCollectionsOpen ? "text-ivory" : "text-ivory/35"
                }`}
              >
                {t("collections")}
                <svg
                  aria-hidden="true"
                  width={9}
                  height={9}
                  className={`shrink-0 opacity-30 transition-transform duration-250 ${
                    isCollectionsOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isCollectionsOpen && (
                  <span className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold" />
                )}
              </button>
              {isCollectionsOpen && (
                <div
                  id="collections-dropdown"
                  ref={collectionsRef}
                  role="menu"
                  aria-label={t("collections")}
                  onMouseEnter={openWithDelay}
                  onMouseLeave={closeWithDelay}
                  className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-5 animate-fade-in"
                >
                  <div className="w-[680px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[6px] border border-ivory/[0.05] bg-black-soft/95 backdrop-blur-xl shadow-premium-lg">
                    <div className="p-7">
                      <p className="mb-5 label-utility tracking-[0.32em] text-ivory/20">
                        {t("our_collections")}
                      </p>
                      <div className="grid grid-cols-3 gap-5">
                        {collections.map((col) => (
                          <div
                            key={col.slug}
                            className="max-w-[200px]"
                            role="none"
                          >
                            <CollectionCard collection={col} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li>
              <Link
                href="/about"
                className={`relative py-2 transition-colors duration-300 hover:text-ivory focus-visible:text-ivory focus-visible:outline-none ${
                  pathname === "/about" ? "text-ivory" : "text-ivory/35"
                }`}
              >
                {t("about")}
                {pathname === "/about" && (
                  <span className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold" />
                )}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <LanguageSwitcher className="hidden lg:flex" />

          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-ivory/25 transition-colors duration-300 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={t("open_search")}
          >
            <svg
              aria-hidden="true"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="4" />
              <path
                d="M21 21l-4.35-4.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <Link
            href="/wishlist"
            aria-label={`Wishlist${
              wishlistCount > 0
                ? `, ${wishlistCount} item${wishlistCount !== 1 ? "s" : ""}`
                : ""
            }`}
            className={`relative hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              wishlistCount > 0
                ? "text-gold"
                : "text-ivory/25 hover:text-ivory"
            }`}
          >
            <svg
              aria-hidden="true"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill={wishlistCount > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span
                key={`wish-${wishlistCount}`}
                className="absolute -end-1 -top-1 inline-flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-burgundy px-1 text-[0.42rem] font-bold text-ivory"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => toggleDrawer()}
            aria-label={`Open drink box${
              itemCount > 0
                ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}`
                : ""
            }`}
            id="cart-button"
            className={`relative hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              itemCount > 0 ? "text-gold" : "text-ivory/25 hover:text-ivory"
            }`}
          >
            <svg
              aria-hidden="true"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {itemCount > 0 && (
              <span
                key={`cart-${itemCount}`}
                className="absolute -end-1 -top-1 inline-flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-burgundy px-1 text-[0.42rem] font-bold text-ivory"
              >
                {itemCount}
              </span>
            )}
          </button>

          {!isAdminPage && (
            <Link
              href="/admin/login"
              className="hidden xl:inline-flex h-7 items-center rounded-[6px] px-3 text-[0.45rem] font-medium uppercase tracking-[0.18em] text-ivory/15 transition-colors duration-300 hover:text-ivory/35 hover:bg-ivory/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {t("admin")}
            </Link>
          )}

          {!isShopPage && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex md:items-center"
            >
              <label htmlFor="global-search" className="sr-only">
                {t("search_drinks")}
              </label>
              <input
                id="global-search"
                type="search"
                placeholder={tCommon("search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-28 rounded-[6px] border border-ivory/[0.04] bg-ivory/[0.015] px-3 pe-7 text-[0.6rem] text-ivory outline-none transition-all duration-300 placeholder:text-ivory/12 focus:w-36 focus:border-ivory/12 focus:bg-ivory/[0.03]"
              />
            </form>
          )}

          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setIsMenuOpen((c) => !c)}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-ivory/25 transition-colors duration-300 hover:text-ivory lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={t("toggle_menu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <svg
                aria-hidden="true"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="lg:hidden border-t border-ivory/[0.04] liquid-glass-heavy animate-fade-in"
        >
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="font-display text-[0.7rem] font-normal uppercase tracking-[0.5em] text-ivory transition-colors duration-300"
              >
                {websiteName}
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-[6px] text-ivory/30 transition-colors duration-300 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/15"
                aria-label={t("toggle_menu")}
              >
                <svg
                  aria-hidden="true"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobile primary" className="px-4 pt-2 pb-6">
              <div className="flex flex-col gap-0">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-[6px] px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory ${
                    pathname === "/"
                      ? "text-ivory bg-ivory/[0.025]"
                      : "text-ivory/30"
                  }`}
                >
                  {t("home")}
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-[6px] px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory ${
                    isShopPage
                      ? "text-ivory bg-ivory/[0.025]"
                      : "text-ivory/30"
                  }`}
                >
                  {t("shop")}
                </Link>

                <details className="group rounded-[6px]">
                  <summary className="flex cursor-pointer items-center justify-between rounded-[6px] px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-ivory/30 transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                    {t("collections")}
                    <svg
                      aria-hidden="true"
                      width={12}
                      height={12}
                      className="h-3 w-3 shrink-0 opacity-40 transition-transform duration-250 group-open:rotate-180"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="space-y-0.5 px-3 pb-2 pt-1">
                    {collections.map((col) => (
                      <Link
                        key={col.slug}
                        href={`/shop?category=${col.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-[6px] px-5 py-3 text-[0.68rem] text-ivory/25 transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory"
                      >
                        {col.title}
                      </Link>
                    ))}
                  </div>
                </details>

                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-[6px] px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory ${
                    pathname === "/about"
                      ? "text-ivory bg-ivory/[0.025]"
                      : "text-ivory/30"
                  }`}
                >
                  {t("about")}
                </Link>
              </div>

              <div className="mx-5 my-5 h-px bg-ivory/[0.05]" />

              <div className="flex flex-col gap-2.5 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCmdOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-[6px] border border-ivory/[0.04] bg-ivory/[0.015] px-4 py-3.5 text-left text-[0.68rem] text-ivory/20 transition-colors duration-200 hover:border-ivory/[0.08] hover:text-ivory/35"
                >
                  <svg
                    aria-hidden="true"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="shrink-0 text-ivory/12"
                  >
                    <circle cx="11" cy="11" r="4" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <span>Search</span>
                </button>

                <div className="flex gap-2.5">
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-[6px] border border-ivory/[0.04] bg-ivory/[0.015] text-ivory/25 transition-colors duration-200 hover:border-ivory/[0.08] hover:text-gold"
                  >
                    <svg
                      aria-hidden="true"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill={wishlistCount > 0 ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <span className="text-[0.65rem] uppercase tracking-[0.18em]">
                      Wishlist
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleDrawer();
                    }}
                    className="relative flex h-11 flex-1 items-center justify-center gap-2.5 rounded-[6px] border border-ivory/[0.04] bg-ivory/[0.015] text-ivory/25 transition-colors duration-200 hover:border-ivory/[0.08] hover:text-gold"
                  >
                    <svg
                      aria-hidden="true"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <span className="text-[0.65rem] uppercase tracking-[0.18em]">
                      Cart
                    </span>
                    {itemCount > 0 && (
                      <span className="absolute -end-1.5 -top-1.5 flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-burgundy px-1 text-[0.42rem] font-bold text-ivory">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {!isAdminPage && (
                <div className="mt-5 px-2">
                  <Link
                    href="/admin/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block rounded-[6px] px-5 py-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-ivory/15 transition-colors duration-200 hover:bg-ivory/[0.025] hover:text-ivory/30"
                  >
                    {t("admin_login")}
                  </Link>
                </div>
              )}

              <div className="mx-5 mt-5 h-px bg-ivory/[0.04]" />
              <div className="mt-4 px-2">
                <MobileLanguageSwitcher onSelect={() => setIsMenuOpen(false)} />
              </div>
            </nav>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
        />
      </Suspense>
    </header>
  );
}
