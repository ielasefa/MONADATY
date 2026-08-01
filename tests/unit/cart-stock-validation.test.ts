import { describe, it, expect } from "vitest";

type CartItem = { id: string; quantity: number };

function validateAddToCart(
  product: { id: string; slug: string; name: string; stock?: number; available?: boolean },
  requestedQuantity: number,
  currentCartItems: CartItem[],
): { ok: true } | { ok: false; reason: "out_of_stock" | "exceeds_stock" } {
  const isAvailable = typeof product.available === "boolean" ? product.available : true;
  const stock = typeof product.stock === "number" ? product.stock : Number.POSITIVE_INFINITY;

  if (!isAvailable || stock <= 0) {
    return { ok: false, reason: "out_of_stock" };
  }

  const currentInCart =
    currentCartItems.find((item) => item.id === product.id)?.quantity ?? 0;

  if (currentInCart + requestedQuantity > stock) {
    return { ok: false, reason: "exceeds_stock" };
  }

  return { ok: true };
}

describe("cart addItem — stock validation logic", () => {
  it("blocks adding a product that is not available", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 10, available: false };
    const result = validateAddToCart(product, 1, []);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("out_of_stock");
  });

  it("blocks adding when stock is zero", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 0, available: true };
    const result = validateAddToCart(product, 1, []);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("out_of_stock");
  });

  it("allows negative quantities (caller's responsibility)", () => {
    // The validation focuses on stock. Callers (UI, business logic) must enforce positive quantities.
    const product = { id: "p1", slug: "p1", name: "Test", stock: 10, available: true };
    const result = validateAddToCart(product, -1, []);
    expect(result.ok).toBe(true);
  });

  it("allows zero quantities (callers may use 0 to update without adding)", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 10, available: true };
    const result = validateAddToCart(product, 0, []);
    expect(result.ok).toBe(true);
  });

  it("allows when quantity is within stock", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 10, available: true };
    const result = validateAddToCart(product, 3, []);
    expect(result.ok).toBe(true);
  });

  it("blocks when combined cart + new exceeds stock", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 5, available: true };
    const cart = [{ id: "p1", quantity: 3 }];
    const result = validateAddToCart(product, 3, cart);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("exceeds_stock");
  });

  it("allows when combined cart + new is within stock", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 5, available: true };
    const cart = [{ id: "p1", quantity: 3 }];
    const result = validateAddToCart(product, 2, cart);
    expect(result.ok).toBe(true);
  });

  it("treats unknown stock as unlimited when product has no stock field", () => {
    const product = { id: "p1", slug: "p1", name: "Test", available: true };
    const result = validateAddToCart(product, 1000, []);
    expect(result.ok).toBe(true);
  });

  it("does not confuse stock of different products", () => {
    const product = { id: "p1", slug: "p1", name: "Test", stock: 5, available: true };
    const cart = [{ id: "p2", quantity: 100 }];
    const result = validateAddToCart(product, 3, cart);
    expect(result.ok).toBe(true);
  });
});
