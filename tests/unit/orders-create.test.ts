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
  product: { findMany: productFindMany, findUnique: productFindUnique, updateMany: productUpdateMany },
  coupon: { findUnique: couponFindUnique, updateMany: couponUpdateMany },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: mocks.orderFindUnique },
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));

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
    total: "108.00 DH",
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
    orderCreate.mockImplementation(({ data }: { data: { orderNumber: string } }) =>
      Promise.resolve(confirmedOrder({ orderNumber: data.orderNumber })),
    );
    transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));
  });

  it("uses canonical database data and decrements stock safely inside one transaction", async () => {
    const result = await createOrder(input);

    expect(result).toMatchObject({ id: "order-1", total: "108.00 DH", replayed: false });
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: "100.00 DH",
          tax: "8.00 DH",
          total: "108.00 DH",
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
      confirmedOrder({ items: [{ name: databaseProduct.name, quantity: 5, unitPrice: databaseProduct.price }], total: "270.00 DH" }),
    );

    await createOrder({ ...input, items: [...input.items, { ...input.items[0], quantity: 3 }] });

    expect(productUpdateMany).toHaveBeenCalledTimes(1);
    expect(productUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ stock: { gte: 5 } }),
      data: { stock: { decrement: 5 } },
    }));
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
