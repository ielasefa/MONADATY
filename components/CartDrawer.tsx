"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { SodaCan } from "@/components/visuals/SodaCan";
import { SodaBottle } from "@/components/visuals/SodaBottle";
import { GlassDrink } from "@/components/visuals/GlassDrink";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

export function CartDrawer() {
  const { closeDrawer, isDrawerOpen, itemCount, items, removeItem, subtotal, updateQuantity } = useCart();
  const { t } = useTranslation("cart");
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
        className={`fixed end-0 top-0 z-[65] flex h-full w-full max-w-[26rem] flex-col border-s border-ivory/[0.04] bg-black/80 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out ${
          isDrawerOpen
            ? "translate-x-0 rtl:-translate-x-0 opacity-100"
            : "pointer-events-none translate-x-full rtl:-translate-x-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="px-6 pb-3 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="label-utility text-ivory/15">{t("your_box")}</span>
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
        <div className="rule-ivory mx-6" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[20rem] flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-input border border-ivory/[0.04] bg-black-surface">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-ivory/6"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p className="font-display text-lg text-ivory">{t("your_box_empty")}</p>
              <p className="mt-3 max-w-[14rem] text-[0.72rem] leading-relaxed text-ivory/15">
                {t("explore_collection_desc")}
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="btn-primary"
              >
                {t("explore_collection")}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-ivory/[0.04]">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-4 py-5 transition-all duration-200">
                  {/* Product image */}
                  <div className="relative h-[5rem] w-[4rem] shrink-0 overflow-hidden bg-black rounded-input">
                    {item.image ? (
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center label-utility text-ivory/8">
                            {item.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                          </div>
                        }
                      />
                    ) : item.visual ? (
                      <div className="flex h-full w-full items-center justify-center p-1.5">
                        {item.visual === "can" ? (
                          <SodaCan width={56} height={72} accent={item.accent} label={item.name} />
                        ) : item.visual === "bottle" ? (
                          <SodaBottle width={48} height={84} accent={item.accent} label={item.name} />
                        ) : (
                          <GlassDrink width={62} height={68} accent={item.accent} label={item.name} />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium text-ivory/6">
                          {item.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                    <div className="min-w-0">
                      {item.category && (
                        <p className="label-utility text-ivory/12">{item.category}</p>
                      )}
                      <h3 className="mt-1 truncate font-display text-[0.82rem] text-ivory">{item.name}</h3>
                      <p className="mt-1 text-[0.75rem] font-semibold text-gold">{item.price}</p>
                    </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center border border-ivory/[0.04] bg-transparent rounded-input">
<button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-l-input text-[0.7rem] text-ivory/20 transition-colors duration-150 hover:bg-ivory/[0.03] hover:text-ivory"
          aria-label={`${t("decrease_qty_item")} ${item.name}`}
        >
                  &minus;
                </button>
                <span className="min-w-[1.8rem] border-x border-ivory/[0.04] text-center label-utility text-ivory">
                  {item.quantity}
                </span>
<button
          type="button"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-r-input text-[0.7rem] text-ivory/20 transition-colors duration-150 hover:bg-ivory/[0.03] hover:text-ivory"
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
            <div className="rule-ivory mb-5" />
            <div className="flex items-baseline justify-between">
              <span className="label-utility text-ivory/20">{t("cart_subtotal")}</span>
              <span className="text-xl font-semibold text-ivory">{subtotal}</span>
            </div>
            <p className="mt-1 label-utility text-ivory/12">{t("taxes_shipping_note")}</p>

            <div className="my-4 rule-ivory" />

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
