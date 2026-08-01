import { describe, it, expect, beforeEach, vi } from "vitest";

const mockRequireOrigin = vi.fn<() => null | Response>(() => null);
const mockGetAuthenticatedAdmin = vi.fn();
const mockRateLimit = vi.fn<(...args: unknown[]) => boolean>(() => false);
const mockCreateOrder = vi.fn();

vi.mock("@/lib/csrf", () => ({
  requireOrigin: () => mockRequireOrigin(),
}));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedAdmin: () => mockGetAuthenticatedAdmin(),
}));
vi.mock("@/lib/rate-limiter", () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));
vi.mock("@/lib/orders", () => ({
  createOrder: (input: unknown) => mockCreateOrder(input),
  getOrderByNumber: vi.fn(() => null),
}));
vi.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: vi.fn(() => Promise.resolve()),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { city: { findFirst: vi.fn(() => Promise.resolve({ id: "c1", name: "Casablanca" })) } },
}));

import { POST } from "@/app/api/orders/create/route";

const validBody = {
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  phone: "+212600112233",
  city: "Casablanca",
  address: "123 Test Street",
  items: [
    { productId: "p1", name: "Item", slug: "item", image: "", quantity: 2, unitPrice: "50.00 DH", totalPrice: "100.00 DH" },
  ],
  idempotencyKey: "key-1",
  subtotal: "100.00 DH",
  shipping: "0.00 DH",
  shippingMethod: "delivery",
  tax: "8.00 DH",
  total: "108.00 DH",
  postalCode: "20000",
};

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/orders/create", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/orders/create", () => {
  beforeEach(() => {
    mockRequireOrigin.mockReset();
    mockRequireOrigin.mockReturnValue(null);
    mockGetAuthenticatedAdmin.mockReset();
    mockRateLimit.mockReset();
    mockRateLimit.mockReturnValue(false);
    mockCreateOrder.mockReset();
    mockCreateOrder.mockResolvedValue({ orderNumber: "MON-001", id: "o1" });
  });

  it("rejects requests with invalid CSRF (origin check)", async () => {
    mockRequireOrigin.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    );

    const res = await POST(makeRequest(validBody) as never);
    expect(res.status).toBe(403);
  });

  it("rejects when rate limit exceeded", async () => {
    mockRateLimit.mockReturnValueOnce(true);

    const res = await POST(makeRequest(validBody) as never);
    expect(res.status).toBe(429);
  });

  it("rejects missing customer name", async () => {
    const res = await POST(makeRequest({ ...validBody, customerName: "" }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid email", async () => {
    const res = await POST(makeRequest({ ...validBody, customerEmail: "not-an-email" }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid Moroccan phone", async () => {
    const res = await POST(makeRequest({ ...validBody, phone: "12345" }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid postal code", async () => {
    const res = await POST(makeRequest({ ...validBody, postalCode: "abc" }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects empty items array", async () => {
    const res = await POST(makeRequest({ ...validBody, items: [] }) as never);
    expect(res.status).toBe(400);
  });

  it("creates an order on a valid request", async () => {
    mockCreateOrder.mockResolvedValueOnce({ orderNumber: "MON-TEST-001", id: "order-1" });

    const res = await POST(makeRequest(validBody) as never);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.order.orderNumber).toBe("MON-TEST-001");
  });

  it("returns 400 when createOrder returns an error", async () => {
    mockCreateOrder.mockResolvedValueOnce({ error: "Insufficient stock" });

    const res = await POST(makeRequest(validBody) as never);
    expect(res.status).toBe(400);
  });
});
