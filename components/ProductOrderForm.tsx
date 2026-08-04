"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/components/cart-context";
import type { Product } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type ProductOrderFormProps = {
  product: Product;
};

type OrderFormState = {
  name: string;
  phone: string;
  city: string;
  address: string;
};

type OrderFormErrors = Partial<Record<keyof OrderFormState, string>>;

const emptyForm: OrderFormState = {
  name: "",
  phone: "",
  city: "",
  address: "",
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductOrderForm({ product }: ProductOrderFormProps) {
  const { addItem } = useCart();
  const { t } = useTranslation("products");
  const [quantity, setQuantity] = useState(1);
  const [formState, setFormState] = useState<OrderFormState>(emptyForm);
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  function handleAddToCart() {
    if (isOutOfStock || adding) return;
    setAdding(true);
    addItem(product, quantity);
    window.setTimeout(() => setAdding(false), 350);
  }

  function handleChange(field: keyof OrderFormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: OrderFormErrors = {};
    (Object.keys(formState) as Array<keyof OrderFormState>).forEach((field) => {
      if (formState[field].trim().length === 0) {
        nextErrors[field] = t("required_field");
      }
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    window.setTimeout(() => {
      setSuccessMessage(t("box_request_ready"));
      setFormState(emptyForm);
      setQuantity(1);
      setSubmitting(false);
    }, 380);
  }

  return (
    <section className="space-y-5">
      {successMessage && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mb-4 px-1 py-3 text-sm text-ivory"
        >
          <span className="font-medium">{t("success")}</span> {successMessage}
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-b border-ivory/[0.04] pb-4">
        <div className="flex items-center gap-1 rounded-input border border-ivory/[0.04] bg-black p-0.5">
          <motion.button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="h-9 w-9 rounded-input text-ivory/35 transition-colors duration-200 hover:bg-ivory/[0.04] hover:text-ivory flex items-center justify-center text-base font-medium"
            aria-label={t("decrease_qty")}
          >
            &minus;
          </motion.button>
          <motion.span
            key={`qty-${quantity}`}
            initial={{ opacity: 0.4, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="min-w-7 text-center text-sm font-medium text-ivory"
          >
            {quantity}
          </motion.span>
          <motion.button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15, ease: EASE }}
            className="h-9 w-9 rounded-input text-ivory/35 transition-colors duration-200 hover:bg-ivory/[0.04] hover:text-ivory flex items-center justify-center text-base font-medium"
            aria-label={t("increase_qty")}
          >
            +
          </motion.button>
        </div>

        <motion.button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          whileHover={isOutOfStock || adding ? undefined : { y: -2, scale: 1.01 }}
          whileTap={isOutOfStock || adding ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {adding ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t("adding")}
            </span>
          ) : (
            t("add_to_box")
          )}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        <div className="grid gap-3.5 md:grid-cols-2">
          <motion.label className="space-y-1.5" whileFocus={{ scale: 1.005 }} transition={{ duration: 0.18, ease: EASE }}>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("name")}</span>
            <input
              id={`name-${product.id}`}
              type="text"
              name="name"
              value={formState.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder={t("full_name_placeholder")}
              className={`l-input ${errors.name ? "l-input-error" : ""}`}
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `name-error-${product.id}` : undefined}
              required
            />
            {errors.name && <p id={`name-error-${product.id}`} className="text-xs text-burgundy">{errors.name}</p>}
          </motion.label>

          <motion.label className="space-y-1.5" whileFocus={{ scale: 1.005 }} transition={{ duration: 0.18, ease: EASE }}>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("phone")}</span>
            <input
              id={`phone-${product.id}`}
              type="tel"
              name="phone"
              value={formState.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder={t("phone_placeholder")}
              className={`l-input ${errors.phone ? "l-input-error" : ""}`}
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? `phone-error-${product.id}` : undefined}
              required
            />
            {errors.phone && <p id={`phone-error-${product.id}`} className="text-xs text-burgundy">{errors.phone}</p>}
          </motion.label>
        </div>

        <div className="grid gap-3.5 md:grid-cols-2">
          <motion.label className="space-y-1.5" whileFocus={{ scale: 1.005 }} transition={{ duration: 0.18, ease: EASE }}>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("city")}</span>
            <input
              id={`city-${product.id}`}
              type="text"
              name="city"
              value={formState.city}
              onChange={(event) => handleChange("city", event.target.value)}
              placeholder={t("city")}
              className={`l-input ${errors.city ? "l-input-error" : ""}`}
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? `city-error-${product.id}` : undefined}
              required
            />
            {errors.city && <p id={`city-error-${product.id}`} className="text-xs text-burgundy">{errors.city}</p>}
          </motion.label>

          <motion.label className="space-y-1.5" whileFocus={{ scale: 1.005 }} transition={{ duration: 0.18, ease: EASE }}>
            <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("address")}</span>
            <input
              id={`address-${product.id}`}
              type="text"
              name="address"
              value={formState.address}
              onChange={(event) => handleChange("address", event.target.value)}
              placeholder={t("address_placeholder")}
              className={`l-input ${errors.address ? "l-input-error" : ""}`}
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? `address-error-${product.id}` : undefined}
              required
            />
            {errors.address && <p id={`address-error-${product.id}`} className="text-xs text-burgundy">{errors.address}</p>}
          </motion.label>
        </div>

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : { y: -2, scale: 1.005 }}
          whileTap={submitting ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              {t("submitting")}
            </span>
          ) : (
            t("build_drink_order")
          )}
        </motion.button>
      </form>
    </section>
  );
}
