"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type QuickViewProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickView({ product, open, onClose }: QuickViewProps) {
  const { addItem } = useCart();
  const { t } = useTranslation("products");
  const [quantity, setQuantity] = useState(1);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const nodes = focusable ? Array.from(focusable) : [];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  function handleAdd() {
    addItem(product, quantity);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} ${t("quick_view")}`}
        className="relative z-10 w-[min(92vw,44rem)] rounded-input border border-ivory/[0.05] bg-black-surface p-5 animate-fade-in"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-input bg-ivory/[0.04] text-lg text-ivory/25 transition-colors duration-200 hover:text-ivory"
          aria-label={t("close_quick_view")}
        >
          &times;
        </button>
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <div className="flex-1">
            <div className="aspect-[4/5] overflow-hidden rounded-input bg-black p-4">
              <div className="flex h-full items-center justify-center">
                <ProductImage
                  product={product}
                  alt={product.name}
                  fill
                  sizes="(min-width: 768px) 40vw, 80vw"
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-medium text-ivory">{product.name}</h3>
            <p className="mt-2 text-lg font-semibold text-gold">{product.price}</p>
            <p className="mt-3 text-sm text-ivory/35">{product.description}</p>

            <div className="h-px bg-ivory/[0.04] my-4" />

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-input border border-ivory/[0.06] bg-transparent p-0.5">
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-9 w-9 text-ivory/30 transition-colors duration-200 hover:text-ivory" aria-label={t("decrease_qty")}>&minus;</button>
                <span className="min-w-7 text-center text-sm text-ivory">{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)} className="h-9 w-9 text-ivory/30 transition-colors duration-200 hover:text-ivory" aria-label={t("increase_qty")}>+</button>
              </div>

              <button onClick={handleAdd} className="btn-primary flex-1">
                {t("add_to_box")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
