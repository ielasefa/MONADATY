"use client";

import { useEffect, useState } from "react";
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

export function ProductOrderForm({ product }: ProductOrderFormProps) {
  const { addItem } = useCart();
  const { t } = useTranslation("products");
  const [quantity, setQuantity] = useState(1);
  const [formState, setFormState] = useState<OrderFormState>(emptyForm);
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addItem(product, quantity);
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
    setSuccessMessage(t("box_request_ready"));
    setFormState(emptyForm);
    setQuantity(1);
  }

  return (
    <section className="space-y-5">
      {successMessage ? (
        <div role="status" aria-live="polite" className="mb-4 px-1 py-3 text-sm text-ivory animate-fade-up">
          <span className="font-medium">{t("success")}</span> {successMessage}
        </div>
      ) : null}

  <div className="flex flex-wrap items-center gap-3 border-b border-ivory/[0.04] pb-4">
  <div className="flex items-center gap-1 rounded-input border border-ivory/[0.04] bg-black p-0.5">
  <button
    type="button"
    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
    className="h-9 w-9 rounded-input text-ivory/35 transition-colors duration-200 hover:bg-ivory/[0.04] hover:text-ivory flex items-center justify-center text-base font-medium"
    aria-label={t("decrease_qty")}
  >
    &minus;
  </button>
  <span className="min-w-7 text-center text-sm font-medium text-ivory">{quantity}</span>
  <button
    type="button"
    onClick={() => setQuantity((current) => current + 1)}
    className="h-9 w-9 rounded-input text-ivory/35 transition-colors duration-200 hover:bg-ivory/[0.04] hover:text-ivory flex items-center justify-center text-base font-medium"
    aria-label={t("increase_qty")}
  >
    +
  </button>
  </div>

  <button
    type="button"
    onClick={handleAddToCart}
    disabled={isOutOfStock}
    className="btn-primary flex-1"
  >
    {t("add_to_box")}
  </button>
  </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        <div className="grid gap-3.5 md:grid-cols-2">
  <label className="space-y-1.5">
  <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("name")}</span>
  <input
    id={`name-${product.id}`}
    type="text"
    name="name"
    value={formState.name}
    onChange={(event) => handleChange("name", event.target.value)}
    placeholder={t("full_name_placeholder")}
    className={`l-input ${errors.name ? "l-input-error" : ""}`}
    aria-invalid={Boolean(errors.name)}
    aria-describedby={errors.name ? `name-error-${product.id}` : undefined}
    required
  />
  {errors.name ? <p id={`name-error-${product.id}`} className="text-xs text-burgundy">{errors.name}</p> : null}
  </label>

  <label className="space-y-1.5">
  <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("phone")}</span>
  <input
    id={`phone-${product.id}`}
    type="tel"
    name="phone"
    value={formState.phone}
    onChange={(event) => handleChange("phone", event.target.value)}
    placeholder={t("phone_placeholder")}
    className={`l-input ${errors.phone ? "l-input-error" : ""}`}
    aria-invalid={Boolean(errors.phone)}
    aria-describedby={errors.phone ? `phone-error-${product.id}` : undefined}
    required
  />
  {errors.phone ? <p id={`phone-error-${product.id}`} className="text-xs text-burgundy">{errors.phone}</p> : null}
  </label>
  </div>
  <div className="grid gap-3.5 md:grid-cols-2">
  <label className="space-y-1.5">
  <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("city")}</span>
  <input
    id={`city-${product.id}`}
    type="text"
    name="city"
    value={formState.city}
    onChange={(event) => handleChange("city", event.target.value)}
    placeholder={t("city")}
    className={`l-input ${errors.city ? "l-input-error" : ""}`}
    aria-invalid={Boolean(errors.city)}
    aria-describedby={errors.city ? `city-error-${product.id}` : undefined}
    required
  />
  {errors.city ? <p id={`city-error-${product.id}`} className="text-xs text-burgundy">{errors.city}</p> : null}
  </label>

  <label className="space-y-1.5">
  <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-ivory/50">{t("address")}</span>
  <input
    id={`address-${product.id}`}
    type="text"
    name="address"
    value={formState.address}
    onChange={(event) => handleChange("address", event.target.value)}
    placeholder={t("address_placeholder")}
    className={`l-input ${errors.address ? "l-input-error" : ""}`}
    aria-invalid={Boolean(errors.address)}
    aria-describedby={errors.address ? `address-error-${product.id}` : undefined}
    required
  />
  {errors.address ? <p id={`address-error-${product.id}`} className="text-xs text-burgundy">{errors.address}</p> : null}
  </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
        >
          {t("build_drink_order")}
        </button>
      </form>
    </section>
  );
}
