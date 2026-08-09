"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { ProductImage } from "@/components/ProductImage";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCopy } from "@/lib/landing-copy";

export function CartDrawer() {
  const { closeDrawer, isDrawerOpen, itemCount, items, removeItem, subtotal, updateQuantity } = useCart();
  const { t, lang } = useTranslation("cart");
  const copy = getLandingCopy(lang);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (isDrawerOpen) {
      setRendered(true);
    } else {
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDrawerOpen, closeDrawer]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (isDrawerOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const focusable = drawer?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.[0]?.focus();

      const handleKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const nodes = focusable ? Array.from(focusable) : [];
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      document.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", handleKey);
      };
    }

    if (!isDrawerOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
    return;
  }, [isDrawerOpen]);

  if (!rendered) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label={t("drink_box")}
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`storefront-theme fixed end-0 top-0 z-[65] flex h-full w-full max-w-[28rem] flex-col border-s border-gold/[0.16] bg-surface/95 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 ease-out ${
          isDrawerOpen
            ? "translate-x-0 rtl:-translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full rtl:-translate-x-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="px-5 pb-4 pt-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="label-utility text-gold/70">{t("your_box")}</span>
              <h2 id="cart-title" className="text-base font-medium text-ivory">
                {t("your_cart_title")}
              </h2>
              {itemCount > 0 && (
                <span className="label-utility rounded-input bg-burgundy/10 px-2 py-0.5 text-burgundy">
                  {itemCount}
                </span>
              )}
            </div>

<button
        type="button"
        onClick={closeDrawer}
        className="group flex h-10 w-10 items-center justify-center rounded-input border border-ivory/[0.04] bg-transparent text-ivory/20 transition-all duration-200 hover:border-ivory/[0.08] hover:text-ivory"
        aria-label={t("close_cart")}
      >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mx-5 h-px bg-gold/[0.16] sm:mx-6" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/[0.16] bg-card">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                    className="text-gold/45"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="font-display text-lg text-ivory">{t("your_box_empty")}</p>
              <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-white/58">
                {copy.featured.description}
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="btn-primary"
              >
                {t("explore_collection", "Explore Collection")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gold/[0.12]">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-4 py-5 transition-all duration-200">
                  {/* Product image */}
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-gold/[0.12] bg-black">
                    <ProductImage
                      product={item}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Item details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div className="min-w-0">
                      {item.category && (
                        <p className="label-utility text-gold/60">{item.category}</p>
                      )}
                      <h3 className="mt-1 truncate font-display text-[0.82rem] text-ivory">{item.name}</h3>
                      <p className="mt-1 text-[0.75rem] font-semibold text-gold">{item.price}</p>
                    </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center rounded-lg border border-gold/[0.16] bg-black/30">
<button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="flex h-9 w-9 items-center justify-center text-[0.7rem] text-white/55 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
          aria-label={`${t("decrease_qty_item")} ${item.name}`}
        >
                  &minus;
                </button>
                <span className="min-w-[1.8rem] border-x border-gold/[0.12] text-center label-utility text-white">
                  {item.quantity}
                </span>
<button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="flex h-9 w-9 items-center justify-center text-[0.7rem] text-white/55 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
          aria-label={`${t("increase_qty_item")} ${item.name}`}
        >
                  +
                </button>
              </div>

  <button
    type="button"
    onClick={() => removeItem(item.id)}
    className="flex items-center gap-1.5 px-2 py-1.5 label-utility text-ivory/25 transition-colors duration-150 hover:text-burgundy"
                aria-label={`${t("remove")} ${item.name}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                {t("remove")}
              </button>
            </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 pb-6 pt-5">
            <div className="mb-5 h-px bg-gold/[0.16]" />
            <div className="flex items-baseline justify-between">
              <span className="label-utility text-ivory/20">{t("cart_subtotal")}</span>
              <span className="text-xl font-semibold text-ivory">{subtotal}</span>
            </div>
            <p className="mt-1 label-utility text-ivory/12">{t("taxes_shipping_note")}</p>

            <div className="my-4 h-px bg-gold/[0.16]" />

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="btn-primary w-full"
            >
              {t("proceed_to_checkout")}
            </Link>

<button
  type="button"
  onClick={closeDrawer}
  className="btn-secondary mt-2.5 w-full"
>
  {t("continue_shopping")}
</button>
          </div>
        )}
      </aside>
    </>
  );
}
