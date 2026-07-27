export function parseMoney(value: string) {
  return Number(value.replace(/[^0-9.]/g, "")) || 0;
}

export function formatMoney(value: number) {
  return `${value.toFixed(2)} DH`;
}

export function formatPrice(price: string) {
  const num = parseMoney(price);
  return `${num.toFixed(2)} DH`;
}
