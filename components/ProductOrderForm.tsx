"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/components/cart-context";
import type { Product } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";
import { PREMIUM_EASE } from "@/lib/motion";

type ProductOrderFormProps = {
  product: Product;
};

export function ProductOrderForm({ product }: ProductOrderFormProps) {
  const { addItem } = useCart();
  const { t } = useTranslation("products");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  useEffect(() => {
    if (!buying) return;
    const timeout = window.setTimeout(() => setBuying(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [buying]);

  function handleAddToCart() {
    if (isOutOfStock || adding || buying) return;
    setAdding(true);
    addItem(product, quantity);
    window.setTimeout(() => setAdding(false), 350);
  }

  function handleBuyNow() {
    if (isOutOfStock || adding || buying) return;
    setBuying(true);
    addItem(product, quantity);
    window.setTimeout(() => {
      window.location.assign("/checkout");
    }, 300);
  }

  const controlsDisabled = isOutOfStock || adding || buying;

  const buttonBase =
    "h-14 flex-1 w-full rounded-xl px-6 text-[0.62rem] font-medium uppercase tracking-[0.18em] whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0A] disabled:cursor-not-allowed disabled:opacity-40";

  const qtyControl =
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-light text-white/45 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
        <div className="flex w-full max-w-[540px] flex-col gap-4 xl:flex-row xl:items-stretch">
          {/* Quantity selector — quiet, bordered, aligned with the actions */}
          <div className="flex h-14 shrink-0 items-center justify-between rounded-xl border border-white/10 bg-[#0B0B0A]/40 px-2 xl:px-1">
          <span className="sr-only">{t("quantity", "Quantity")}</span>
          <div className="flex h-full items-center gap-1 xl:gap-0">
            <motion.button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={controlsDisabled}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.18, ease: PREMIUM_EASE }}
              className={qtyControl}
              aria-label={t("decrease_qty")}
            >
              &minus;
            </motion.button>
            <motion.span
              key={`qty-${quantity}`}
              initial={shouldReduceMotion ? false : { opacity: 0.4, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: PREMIUM_EASE }}
              className="min-w-10 text-center text-sm font-medium tabular-nums text-white"
            >
              {quantity}
            </motion.span>
            <motion.button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              disabled={controlsDisabled}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.18, ease: PREMIUM_EASE }}
              className={qtyControl}
              aria-label={t("increase_qty")}
            >
              +
            </motion.button>
          </div>
        </div>

        {/* ADD TO CART / BUY NOW — primary, uncluttered */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:flex-1">
          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={controlsDisabled}
            whileHover={controlsDisabled || shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={controlsDisabled || shouldReduceMotion ? undefined : { y: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: PREMIUM_EASE }}
            className={`${buttonBase} bg-rouge text-white shadow-[0_16px_40px_-20px_rgba(110,31,42,0.6)] hover:bg-rouge-hover`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t("adding")}
              </span>
            ) : (
              t("add_to_cart")
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleBuyNow}
            disabled={controlsDisabled}
            whileHover={controlsDisabled || shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={controlsDisabled || shouldReduceMotion ? undefined : { y: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: PREMIUM_EASE }}
            className={`${buttonBase} border-2 border-rouge bg-transparent text-white hover:bg-rouge hover:border-rouge`}
          >
            {buying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rouge/30 border-t-rouge" />
                {t("adding")}
              </span>
            ) : (
              t("buy_now", "Buy Now")
            )}
          </motion.button>
        </div>
      </div>

      {/* Panel footer — stock + trust cue */}
      <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-6">
        <p className="flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/45">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? "bg-white/20" : "bg-gold"}`}
          />
          {isOutOfStock ? t("out_of_stock") : t("in_stock")}
        </p>
        <p className="flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-white/30">
          <svg
            aria-hidden="true"
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" />
          </svg>
          {t("benefit_payment", "Secure Payment")}
        </p>
      </div>
      </div>
    );
  }
