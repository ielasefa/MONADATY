import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logError } from "./logger";
import { formatMoney, parseMoney } from "./money";
import { resolveDatabaseProductImage } from "./product-images";

type RawOrderItem = {
  productId: string | null;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type RawOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "completed" | "cancelled" | "refunded";
  subtotal: string;
  shipping: string;
  shippingMethod: string;
  tax: string;
  total: string;
  currency: string;
  idempotencyKey: string;
  estimatedDelivery: string;
  actualDeliveryDate: string;
  deliveryCompany: string;
  trackingNumber: string;
  deliveryNotes: string;
  discountAmount: string;
  createdAt: Date;
  updatedAt: Date;
  items: RawOrderItem[];
};

export type OrderCreateInput = {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  subtotal: string;
  shipping: string;
  shippingMethod: string;
  tax: string;
  total: string;
  couponCode?: string;
  items: Array<{
    productId: string;
    name: string;
    slug?: string;
    image?: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  idempotencyKey?: string;
};

const MAX_ORDER_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;
const TAX_RATE = 0.08;

export type OrderCreateErrorCode =
  | "VALIDATION_ERROR"
  | "PRODUCT_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "COUPON_INVALID"
  | "ORDER_CREATE_FAILED";

export type OrderCreateResult =
  | {
      id: string;
      orderNumber: string;
      total: string;
      orderStatus: string;
      paymentStatus: string;
      customerName: string;
      customerEmail: string;
      address: string;
      city: string;
      items: Array<{ name: string; quantity: number; unitPrice: string }>;
      replayed: boolean;
    }
  | { error: string; code: OrderCreateErrorCode };

class OrderValidationError extends Error {
  constructor(
    message: string,
    readonly code: OrderCreateErrorCode = "VALIDATION_ERROR",
  ) {
    super(message);
    this.name = "OrderValidationError";
  }
}

type ConfirmedOrder = {
  id: string;
  orderNumber: string;
  total: string;
  orderStatus: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  items: Array<{ name: string; quantity: number; unitPrice: string }>;
};

function confirmedOrderResult(
  order: ConfirmedOrder,
  replayed: boolean,
): Exclude<OrderCreateResult, { error: string }> {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    address: order.address,
    city: order.city,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    replayed,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "P2002");
}

export async function getOrderByIdempotencyKey(
  idempotencyKey: string,
): Promise<Exclude<OrderCreateResult, { error: string }> | null> {
  const order = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true },
  });
  return order ? confirmedOrderResult(order, true) : null;
}

export async function createOrder(input: OrderCreateInput): Promise<OrderCreateResult> {
  const key = input.idempotencyKey ?? crypto.randomUUID();

  const existing = await prisma.order.findUnique({
    where: { idempotencyKey: key },
    include: { items: true },
  });
  if (existing) {
    return confirmedOrderResult(existing, true);
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "At least one item is required", code: "VALIDATION_ERROR" };
  }
  if (input.items.length > MAX_ORDER_ITEMS) {
    return { error: "Too many items in order", code: "VALIDATION_ERROR" };
  }
  for (const item of input.items) {
    if (!item || typeof item !== "object" || !item.productId || typeof item.productId !== "string") {
      return { error: "Invalid item in order", code: "VALIDATION_ERROR" };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
      return { error: `Invalid quantity for "${item.name}"`, code: "VALIDATION_ERROR" };
    }
  }

  // A product can be present more than once in a stale/client-manipulated cart. Treat it as
  // one inventory operation so stock validation and decrement always use the true quantity.
  const groupedItems = new Map<string, OrderCreateInput["items"][number]>();
  for (const item of input.items) {
    const previous = groupedItems.get(item.productId);
    const quantity = (previous?.quantity ?? 0) + item.quantity;
    if (quantity > MAX_ITEM_QUANTITY) {
      return { error: `Invalid quantity for "${item.name}"`, code: "VALIDATION_ERROR" };
    }
    groupedItems.set(item.productId, { ...item, quantity });
  }
  const normalizedItems = [...groupedItems.values()];

  const orderNumber = `MON-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const alreadyCreated = await tx.order.findUnique({
        where: { idempotencyKey: key },
        include: { items: true },
      });
      if (alreadyCreated) return alreadyCreated;

      const productIds = normalizedItems
        .map((item) => item.productId)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      const products = productIds.length > 0
        ? await tx.product.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
              gallery: true,
              images: { select: { url: true, isCover: true, sortOrder: true } },
              price: true,
              stock: true,
              available: true,
              status: true,
            },
          })
        : [];
      const productMap = new Map(products.map((p) => [p.id, p]));

      let serverSubtotal = 0;

      for (const item of normalizedItems) {
        if (!item.productId) continue;

        const product = productMap.get(item.productId);
        if (!product) {
          throw new OrderValidationError(`Product "${item.name}" no longer exists`, "PRODUCT_UNAVAILABLE");
        }
        if (!product.available || product.status !== "Active") {
          throw new OrderValidationError(`Product "${product.name}" is not available for purchase`, "PRODUCT_UNAVAILABLE");
        }
        if (product.stock < item.quantity) {
          throw new OrderValidationError(
            `Insufficient stock for "${product.name}": only ${product.stock} left, requested ${item.quantity}`,
            "OUT_OF_STOCK",
          );
        }
        serverSubtotal += parseMoney(product.price) * item.quantity;
      }

      let discountNum = 0;
      let coupon = null;
      if (input.couponCode) {
        coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
        if (!coupon || !coupon.isActive || (coupon.expiresAt && coupon.expiresAt < new Date())) {
          throw new OrderValidationError("Invalid or expired coupon code", "COUPON_INVALID");
        }
      }

      if (coupon) {
        if (serverSubtotal < parseMoney(coupon.minPurchase)) {
          throw new OrderValidationError(
            `Minimum purchase of ${coupon.minPurchase} required for this coupon`,
            "COUPON_INVALID",
          );
        }
        discountNum = Math.min(
          serverSubtotal,
          parseMoney(coupon.discountAmount)
            || (coupon.discountPercent > 0 ? (serverSubtotal * coupon.discountPercent) / 100 : 0),
        );
        const usage = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.maxUsage > 0 ? { usageCount: { lt: coupon.maxUsage } } : {}),
          },
          data: { usageCount: { increment: 1 } },
        });
        if (usage.count === 0) {
          throw new OrderValidationError("Coupon usage limit reached", "COUPON_INVALID");
        }
      }

      const taxNum = serverSubtotal * TAX_RATE;
      const totalNum = serverSubtotal + taxNum - discountNum;

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          phone: input.phone,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          country: input.country ?? "Morocco",
          subtotal: formatMoney(serverSubtotal),
          shipping: "0.00 DH",
          shippingMethod: input.shippingMethod,
          tax: formatMoney(taxNum),
          total: formatMoney(totalNum),
          couponCode: input.couponCode ?? null,
          discountAmount: formatMoney(discountNum),
          idempotencyKey: key,
          items: {
            create: normalizedItems.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: item.productId,
                name: product.name,
                slug: product.slug,
                image: resolveDatabaseProductImage(product),
                quantity: item.quantity,
                unitPrice: product.price,
                totalPrice: formatMoney(parseMoney(product.price) * item.quantity),
              };
            }),
          },
        },
        include: { items: true },
      });

      for (const item of normalizedItems) {
        if (!item.productId) continue;
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            available: true,
            status: "Active",
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const available = product?.stock ?? 0;
          throw new OrderValidationError(
            `Insufficient stock for "${item.name}": only ${available} left, requested ${item.quantity}`,
            product && (!product.available || product.status !== "Active") ? "PRODUCT_UNAVAILABLE" : "OUT_OF_STOCK",
          );
        }
      }

      return created;
    });

    return confirmedOrderResult(order, order.orderNumber !== orderNumber);
  } catch (e) {
    if (e instanceof OrderValidationError) {
      return { error: e.message, code: e.code };
    }

    // Two identical requests can enter before either sees the existing order. The unique
    // idempotency key rolls one transaction back; return the winner instead of a false error.
    if (isUniqueConstraintError(e)) {
      const committed = await prisma.order.findUnique({
        where: { idempotencyKey: key },
        include: { items: true },
      });
      if (committed) return confirmedOrderResult(committed, true);
    }

    logError(e, "createOrder transaction failed");
    return { error: "Failed to create order. Please try again.", code: "ORDER_CREATE_FAILED" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  data: {
    orderStatus?: string;
    paymentStatus?: string;
    estimatedDelivery?: string;
    actualDeliveryDate?: string;
    deliveryCompany?: string;
    trackingNumber?: string;
    deliveryNotes?: string;
  }
): Promise<void> {
  const updateData: Record<string, string | undefined> = {};
  if (data.orderStatus) updateData.orderStatus = data.orderStatus;
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
  if (data.estimatedDelivery !== undefined) updateData.estimatedDelivery = data.estimatedDelivery;
  if (data.actualDeliveryDate !== undefined) updateData.actualDeliveryDate = data.actualDeliveryDate;
  if (data.deliveryCompany !== undefined) updateData.deliveryCompany = data.deliveryCompany;
  if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber;
  if (data.deliveryNotes !== undefined) updateData.deliveryNotes = data.deliveryNotes;

  const restoresInventory = data.orderStatus === "cancelled" || data.orderStatus === "refunded";

  await prisma.$transaction(async (tx) => {
    if (!restoresInventory) {
      await tx.order.update({ where: { id: orderId }, data: updateData });
      return;
    }

    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new OrderValidationError("Order not found");

    // The conditional status transition is the idempotency guard for restocking. Concurrent
    // cancellation/refund requests can only make this transition once.
    const transitioned = await tx.order.updateMany({
      where: { id: orderId, orderStatus: { notIn: ["cancelled", "refunded"] } },
      data: updateData,
    });

    if (transitioned.count === 0) {
      await tx.order.update({ where: { id: orderId }, data: updateData });
      return;
    }

    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } },
      });
    }
  });
}

// ── Lookup helpers ──────────────────────────────────────────────────────

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) return null;
  return formatOrder(order);
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, customer: true },
  });
  if (!order) return null;
  return formatOrder(order);
}

function formatOrder(o: RawOrder) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    phone: o.phone,
    address: o.address,
    city: o.city,
    postalCode: o.postalCode,
    country: o.country,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    subtotal: o.subtotal,
    shipping: o.shipping,
    shippingMethod: o.shippingMethod,
    tax: o.tax,
    total: o.total,
    currency: o.currency,
    items: (o.items ?? []).map((i: RawOrderItem) => ({
      productId: i.productId ?? "",
      name: i.name,
      slug: i.slug,
      image: i.image,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
    })),
    idempotencyKey: o.idempotencyKey,
    estimatedDelivery: o.estimatedDelivery,
    actualDeliveryDate: o.actualDeliveryDate,
    deliveryCompany: o.deliveryCompany,
    trackingNumber: o.trackingNumber,
    deliveryNotes: o.deliveryNotes,
    discountAmount: o.discountAmount,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}
