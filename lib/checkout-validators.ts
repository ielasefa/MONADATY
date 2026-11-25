/** Checkout delivery coverage is shared by the page and the order API. */
export const CHECKOUT_CITIES = ["Rabat", "Salé"] as const;

export function isCheckoutCity(value: unknown): value is typeof CHECKOUT_CITIES[number] {
  return typeof value === "string" && CHECKOUT_CITIES.some((city) => city === value);
}

export function isValidCheckoutEmail(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== "string") return false;
  const email = value.trim();
  return email === "" || (email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}
