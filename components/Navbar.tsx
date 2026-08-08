"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [search, setSearch] = useState("");
  const [cmdOpen, setCmdOpen] = useState(false);

  const { itemCount, toggleDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  const isShopPage = pathname === "/shop";
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
  <motion.header
    initial={{ y: -24, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    className={`sticky top-0 z-50 transition-all duration-500 will-change-transform ${
      scrolled
        ? "glass-elevated border-b border-white/[0.06]"
        : "bg-black border-b border-transparent"
    }`}
      style={{
        boxShadow: scrolled
          ? "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.22), 0 12px 40px -8px rgba(0,0,0,0.45)"
          : "none",
      }}
    >
      <div className="mx-auto flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 max-w-[1400px] px-6 md:px-10 lg:px-16">
        <Link
          href="/"
          className="group shrink-0 font-display text-[0.8rem] font-normal uppercase tracking-[0.55em] text-gold transition-colors duration-500 hover:text-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-4 focus-visible:ring-offset-black hidden md:inline-block"
          aria-label={`${websiteName} — ${t("home", "Home")}`}
        >
          <span>{websiteName}</span>
        </Link>

        <Link
          href="/"
          className="group md:hidden shrink-0 font-display text-[0.65rem] font-normal uppercase tracking-[0.45em] text-gold transition-colors duration-500 hover:text-gold/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          aria-label={`${websiteName} — ${t("home", "Home")}`}
        >
          <span>{websiteName}</span>
        </Link>

        <nav aria-label={t("primary", "Primary")} className="hidden lg:flex lg:flex-1 lg:justify-center">
          <ul className="flex items-center gap-12 text-[0.52rem] font-medium uppercase tracking-[0.28em]">
            <li>
              <Link
                href="/"
                className={`relative py-2 transition-colors duration-300 hover:text-gold focus-visible:text-gold focus-visible:outline-none ${
                  pathname === "/" ? "text-white" : "text-white/60"
                }`}
              >
                {t("home")}
                {pathname === "/" && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
              </Link>
            </li>
            <li>
              <Link
                href="/shop"
                className={`relative py-2 transition-colors duration-300 hover:text-gold focus-visible:text-gold focus-visible:outline-none ${
                  isShopPage ? "text-white" : "text-white/60"
                }`}
              >
                {t("shop")}
                {isShopPage && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
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
                className={`relative inline-flex items-center gap-2 py-2 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none ${
                  isCollectionsOpen ? "text-white" : "text-white/50"
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
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
              </button>
              <AnimatePresence>
                {isCollectionsOpen && (
                  <motion.div
                    id="collections-dropdown"
                    ref={collectionsRef}
                    role="menu"
                    aria-label={t("collections")}
                    onMouseEnter={openWithDelay}
                    onMouseLeave={closeWithDelay}
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{
                      duration: 0.22,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute left-1/2 top-full z-40 -translate-x-1/2 pt-5"
                  >
                    <div className="w-[680px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-input border border-white/[0.1] bg-black/95 backdrop-blur-xl shadow-premium">
                      <div className="p-7">
                        <p className="mb-5 label-utility tracking-[0.32em] text-white/40">
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
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li>
              <Link
                href="/about"
                className={`relative py-2 transition-colors duration-300 hover:text-white focus-visible:text-white focus-visible:outline-none ${
                  pathname === "/about" ? "text-white" : "text-white/50"
                }`}
              >
                {t("about")}
                {pathname === "/about" && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 left-1/2 h-px w-3.5 -translate-x-1/2 bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
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
            className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-input text-white/50 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
            href="/admin/login"
            className="hidden lg:inline-flex h-9 items-center px-4 rounded-lg bg-burgundy text-xs font-medium text-white transition-all duration-300 hover:bg-burgundy-dark"
          >
            {t("admin_login", "Admin")}
          </Link>

          <Link
            href="/wishlist"
            aria-label={`${t("wishlist", "Wishlist")}${
              wishlistCount > 0
                ? `, ${wishlistCount} ${wishlistCount !== 1 ? t("items", "items") : t("item", "item")}`
                : ""
            }`}
            className={`relative hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-input transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              wishlistCount > 0
                ? "text-gold"
                : "text-white/50 hover:text-white"
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
              <motion.span
                key={`wish-${wishlistCount}`}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="absolute -end-1 -top-1 inline-flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-gold px-1 text-[0.42rem] font-bold text-white"
              >
                {wishlistCount}
              </motion.span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => toggleDrawer()}
            aria-label={`${t("open_cart", "Open drink box")}${
              itemCount > 0
                ? `, ${itemCount} ${itemCount !== 1 ? t("items", "items") : t("item", "item")}`
                : ""
            }`}
            id="cart-button"
            className={`relative hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-input transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
              itemCount > 0 ? "text-gold" : "text-white/50 hover:text-white"
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
              <motion.span
                key={`cart-${itemCount}`}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="absolute -end-1 -top-1 inline-flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-gold px-1 text-[0.42rem] font-bold text-white"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          {!isShopPage && (
            <form
              onSubmit={handleSearchSubmit}
              className="hidden xl:flex xl:items-center"
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
                className="h-8 w-28 rounded-input border border-white/[0.15] bg-white/[0.06] px-3 pe-7 text-[0.6rem] text-white outline-none transition-all duration-300 placeholder:text-white/40 focus:w-36 focus:border-white/30 focus:bg-white/[0.1]"
                style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
              />
            </form>
          )}

          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setIsMenuOpen((c) => !c)}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-input text-white/50 transition-colors duration-300 hover:text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/10 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={t("toggle_menu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
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
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
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
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
 <motion.div
 ref={mobileMenuRef}
 id="mobile-menu"
 role="dialog"
 aria-modal="true"
 aria-label={t("navigation_menu", "Navigation menu")}
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
 className="lg:hidden border-t border-white/[0.06] bg-black overflow-hidden"
 style={{
   background: "rgba(23,23,23,0.97)",
   backdropFilter: "blur(28px) saturate(1.3)",
   borderTop: "1px solid rgba(255,255,255,0.06)",
 }}
>
 <div className="max-h-[85vh] overflow-y-auto">
 <div className="flex items-center justify-between px-6 pt-4 pb-2">
<Link
          href="/"
          onClick={() => setIsMenuOpen(false)}
          className="font-display text-[0.7rem] font-normal uppercase tracking-[0.5em] text-gold transition-colors duration-300"
          aria-label={`${websiteName} — ${t("home", "Home")}`}
        >
     {websiteName}
   </Link>
   <button
     type="button"
     onClick={() => setIsMenuOpen(false)}
     className="flex h-9 w-9 items-center justify-center rounded-input text-white/50 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory/15"
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

 <nav aria-label={t("mobile_primary", "Mobile primary")} className="px-4 pt-2 pb-6">
 <motion.div
   initial={{ opacity: 0 }}
   animate={{ opacity: 1 }}
   transition={{ duration: 0.01 }}
   className="flex flex-col gap-0"
 >
   {[
     { href: "/", label: t("home"), active: pathname === "/" },
     { href: "/shop", label: t("shop"), active: isShopPage },
     { href: "/about", label: t("about"), active: pathname === "/about" },
   ].map((link, i) => (
     <motion.div
       key={link.href}
       initial={{ opacity: 0, x: -12 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{
         duration: 0.4,
         delay: 0.08 + i * 0.06,
         ease: [0.22, 1, 0.36, 1],
       }}
     >
       <Link
         href={link.href}
         onClick={() => setIsMenuOpen(false)}
         className={`rounded-input px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-white/[0.06] hover:text-white ${
           link.active
             ? "text-white bg-white/[0.06]"
             : "text-white/50"
         }`}
       >
         {link.label}
       </Link>
     </motion.div>
   ))}

   <motion.div
     initial={{ opacity: 0, x: -12 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
   >
     <details className="group rounded-input">
       <summary className="flex cursor-pointer items-center justify-between rounded-input px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] text-white/50 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white [&::-webkit-details-marker]:hidden [&::marker]:hidden">
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
             className="block rounded-input px-5 py-3 text-[0.68rem] text-white/50 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
           >
             {col.title}
           </Link>
         ))}
       </div>
     </details>
   </motion.div>

   <motion.div
     initial={{ opacity: 0, x: -12 }}
     animate={{ opacity: 1, x: 0 }}
     transition={{ duration: 0.4, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
   >
     <Link
       href="/about"
       onClick={() => setIsMenuOpen(false)}
       className={`rounded-input px-5 py-4 text-[0.75rem] font-medium uppercase tracking-[0.22em] transition-colors duration-200 hover:bg-white/[0.06] hover:text-white ${
         pathname === "/about"
           ? "text-white bg-white/[0.06]"
           : "text-white/50"
       }`}
     >
       {t("about")}
     </Link>
   </motion.div>

   <motion.div
     initial={{ opacity: 0, scale: 0.96 }}
     animate={{ opacity: 1, scale: 1 }}
     transition={{ duration: 0.4, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
   >
     <Link
       href="/admin/login"
       onClick={() => setIsMenuOpen(false)}
       className="inline-flex h-10 w-full items-center justify-center rounded-btn bg-burgundy text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white shadow-rouge transition-all duration-300 hover:bg-burgundy-dark active:translate-y-0"
     >
       {t("admin_login", "Connexion Admin")}
     </Link>
   </motion.div>
 </motion.div>
 </nav>

              <div className="mx-5 my-5 h-px bg-white/[0.08]" />

              <div className="flex flex-col gap-2.5 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setCmdOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-input border border-white/[0.12] bg-white/[0.04] px-4 py-3.5 text-left text-[0.68rem] text-white/40 transition-colors duration-200 hover:border-white/[0.2] hover:text-white/50"
                >
                  <svg
                    aria-hidden="true"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="shrink-0 text-white/20"
                  >
                    <circle cx="11" cy="11" r="4" />
                    <path
                      d="M21 21l-4.35-4.35"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{t("open_search", "Search")}</span>
                </button>

                <div className="flex gap-2.5">
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex h-11 flex-1 items-center justify-center gap-2.5 rounded-input border border-white/[0.12] bg-white/[0.04] text-white/50 transition-colors duration-200 hover:border-white/[0.2] hover:text-gold"
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
                      {t("wishlist", "Wishlist")}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      toggleDrawer();
                    }}
                    className="relative flex h-11 flex-1 items-center justify-center gap-2.5 rounded-input border border-white/[0.12] bg-white/[0.04] text-white/50 transition-colors duration-200 hover:border-white/[0.2] hover:text-gold"
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
                      {t("cart", "Cart")}
                    </span>
                    {itemCount > 0 && (
                      <span className="absolute -end-1.5 -top-1.5 flex h-3.5 min-w-[0.8rem] items-center justify-center rounded-full bg-gold px-1 text-[0.42rem] font-bold text-white">
                        {itemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="mx-5 mt-5 h-px bg-white/[0.06]" />
              <div className="mt-4 px-2">
                <MobileLanguageSwitcher onSelect={() => setIsMenuOpen(false)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      </Suspense>
    </motion.header>
  );
}