export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSku(name: string): string {
  const prefix = name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
    .join("-");
  const suffix = Math.random().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${suffix}`;
}

export function stripCurrency(val: string): string {
  return val.replace(/[^0-9.]/g, "");
}

export function formatPrice(val: string, currency: string): string {
  const num = parseFloat(stripCurrency(val));
  if (isNaN(num)) return `0.00 ${currency}`;
  return `${num.toFixed(2)} ${currency}`;
}

export function extractCurrency(priceStr: string): string {
  const parts = priceStr.split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : "MAD";
}

export function extractNumeric(priceStr: string): string {
  return stripCurrency(priceStr);
}

export function computeProfit(regularPrice: string, costPrice: string): number {
  const reg = parseFloat(regularPrice) || 0;
  const cost = parseFloat(costPrice) || 0;
  return reg - cost;
}

export function computeMargin(regularPrice: string, costPrice: string): number {
  const reg = parseFloat(regularPrice) || 0;
  if (reg <= 0) return 0;
  return (computeProfit(regularPrice, costPrice) / reg) * 100;
}

export const CURRENCIES = ["MAD", "EUR", "USD"];
