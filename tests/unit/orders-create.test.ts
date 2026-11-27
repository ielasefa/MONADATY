import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  orderFindUnique: vi.fn(),
  orderCreate: vi.fn(),
  productFindMany: vi.fn(),
  productFindUnique: vi.fn(),
  productUpdateMany: vi.fn(),
  couponFindUnique: vi.fn(),
  couponUpdateMany: vi.fn(),
  transaction: vi.fn(),
}));

const {
  orderFindUnique,
  orderCreate,
  productFindMany,
  productFindUnique,
  productUpdateMany,
  couponFindUnique,
  couponUpdateMany,
  transaction,
} = mocks;

const tx = {
  order: { findUnique: orderFindUnique, create: orderCreate },
  product: { findMany: productFindMany, findUnique: productFindUnique, findUniqueOrThrow: productFindUnique, updateMany: productUpdateMany },
  coupon: { findUnique: couponFindUnique, updateMany: couponUpdateMany },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: mocks.orderFindUnique },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/lib/stock-allocation", () => ({ allocateStockChange: vi.fn(), restoreOrderAllocations: vi.fn() }));

import { createOrder, type OrderCreateInput } from "@/lib/orders";

const input: OrderCreateInput = {
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  phone: "+212600112233",
  address: "123 Test Street",
  city: "Casablanca",
  postalCode: "20000",
  country: "Morocco",
  subtotal: "1.00 DH",
  shipping: "0.00 DH",
  shippingMethod: "delivery",
  tax: "0.00 DH",
  total: "1.00 DH",
  idempotencyKey: "idem_stable_checkout_key",
  items: [
    {
      productId: "p1",
      name: "Client supplied name",
      slug: "client-slug",
      image: "/client-image.jpg",
      quantity: 2,
      unitPrice: "1.00 DH",
      totalPrice: "2.00 DH",
    },
  ],
};

const databaseProduct = {
  id: "p1",
  name: "Coca-Cola 1.5L",
  slug: "coca-cola-15l",
  image: "/uploads/coca-cola.webp",
  gallery: [],
  images: [],
  price: "50.00 DH",
  stock: 10,
  available: true,
  status: "Active",
};

function confirmedOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "order-1",
    orderNumber: "MON-001",
    total: "100.00 DH",
    orderStatus: "pending",
    paymentStatus: "pending",
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    address: input.address,
    city: input.city,
    items: [{ name: databaseProduct.name, quantity: 2, unitPrice: databaseProduct.price }],
    ...overrides,
  };
}

describe("createOrder transaction and idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderFindUnique.mockResolvedValue(null);
    productFindMany.mockResolvedValue([databaseProduct]);
    productUpdateMany.mockResolvedValue({ count: 1 });
    productFindUnique.mockResolvedValue(databaseProduct);
    orderCreate.mockImplementation(({ data }: { data: { orderNumber: string; total: string } }) =>
      Promise.resolve(confirmedOrder({ orderNumber: data.orderNumber, total: data.total })),
    );
    transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));
  });

  it("uses canonical database data and decrements stock safely inside one transaction", async () => {
    const result = await createOrder(input);

    expect(result).toMatchObject({ id: "order-1", total: "100.00 DH", replayed: false });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: "100.00 DH",
          tax: "0.00 DH",
          shipping: "0.00 DH",
          total: "100.00 DH",
          items: {
            create: [
              expect.objectContaining({
                productId: "p1",
                name: databaseProduct.name,
                slug: databaseProduct.slug,
                image: databaseProduct.image,
                quantity: 2,
                unitPrice: databaseProduct.price,
                totalPrice: "100.00 DH",
              }),
            ],
          },
        }),
      }),
    );
    expect(productUpdateMany).toHaveBeenCalledWith({
      where: { id: "p1", available: true, status: "Active", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(orderCreate.mock.invocationCallOrder[0]).toBeLessThan(productUpdateMany.mock.invocationCallOrder[0]);
  });

  it("aggregates duplicate product lines before validation and decrement", async () => {
    orderCreate.mockResolvedValueOnce(
      confirmedOrder({ items: [{ name: databaseProduct.name, quantity: 5, unitPrice: databaseProduct.price }], total: "250.00 DH" }),
    );

    await createOrder({ ...input, items: [...input.items, { ...input.items[0], quantity: 3 }] });

    expect(productUpdateMany).toHaveBeenCalledTimes(1);
    expect(productUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ stock: { gte: 5 } }),
      data: { stock: { decrement: 5 } },
    }));
    expect(orderCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ subtotal: "250.00 DH", tax: "0.00 DH", total: "250.00 DH" }) }));
  });

  it("charges exactly the catalogue price times quantity despite client-supplied fees", async () => {
    productFindMany.mockResolvedValueOnce([{ ...databaseProduct, price: "24.00 DH" }]);
    const result = await createOrder({ ...input, items: [{ ...input.items[0], quantity: 3 }], subtotal: "1.00 DH", tax: "5.76 DH", shipping: "50.00 DH", total: "127.76 DH" });
    expect(result).toMatchObject({ total: "72.00 DH" });
    expect(orderCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ subtotal: "72.00 DH", tax: "0.00 DH", shipping: "0.00 DH", total: "72.00 DH" }) }));
  });

  it("still applies valid discounts without introducing any extra fees", async () => {
    couponFindUnique.mockResolvedValueOnce({ id: "coupon-1", isActive: true, expiresAt: null, minPurchase: "0.00 DH", discountAmount: "0.00 DH", discountPercent: 10, maxUsage: 0 });
    couponUpdateMany.mockResolvedValueOnce({ count: 1 });
    const result = await createOrder({ ...input, couponCode: "SAVE10" });
    expect(result).toMatchObject({ total: "90.00 DH" });
    expect(orderCreate).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ subtotal: "100.00 DH", tax: "0.00 DH", shipping: "0.00 DH", discountAmount: "10.00 DH", total: "90.00 DH" }) }));
  });

  it("rejects insufficient stock before creating an order", async () => {
    productFindMany.mockResolvedValueOnce([{ ...databaseProduct, stock: 1 }]);

    const result = await createOrder(input);

    expect(result).toMatchObject({ code: "OUT_OF_STOCK" });
    expect(orderCreate).not.toHaveBeenCalled();
    expect(productUpdateMany).not.toHaveBeenCalled();
  });

  it("returns an existing order without opening another transaction", async () => {
    orderFindUnique.mockResolvedValueOnce(confirmedOrder());

    const result = await createOrder(input);

    expect(result).toMatchObject({ orderNumber: "MON-001", replayed: true });
    expect(transaction).not.toHaveBeenCalled();
  });

  it("recovers the committed winner after a concurrent idempotency conflict", async () => {
    transaction.mockRejectedValueOnce({ code: "P2002" });
    orderFindUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(confirmedOrder());

    const result = await createOrder(input);

    expect(result).toMatchObject({ orderNumber: "MON-001", replayed: true });
  });
});
