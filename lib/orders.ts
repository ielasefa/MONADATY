import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logError } from "./logger";
import { formatMoney, parseMoney } from "./money";

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

class OrderValidationError extends Error {}

export async function createOrder(input: OrderCreateInput): Promise<{ orderNumber: string; id: string } | { error: string }> {
  const key = input.idempotencyKey ?? crypto.randomUUID();

  const existing = await prisma.order.findUnique({ where: { idempotencyKey: key } });
  if (existing) {
    return { orderNumber: existing.orderNumber, id: existing.id };
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "At least one item is required" };
  }
  if (input.items.length > MAX_ORDER_ITEMS) {
    return { error: "Too many items in order" };
  }
  for (const item of input.items) {
    if (!item || typeof item !== "object" || !item.productId || typeof item.productId !== "string") {
      return { error: "Invalid item in order" };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
      return { error: `Invalid quantity for "${item.name}"` };
    }
  }

  const orderNumber = `MON-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  let coupon: { id: string; discountPercent: number; discountAmount: string; minPurchase: string; maxUsage: number; expiresAt: Date | null } | null = null;

  if (input.couponCode) {
    const found = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
    if (!found || !found.isActive) {
      return { error: "Invalid or expired coupon code" };
    }
    if (found.expiresAt && found.expiresAt < new Date()) {
      return { error: "Coupon has expired" };
    }
    coupon = found;
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = input.items
        .map((item) => item.productId)
        .filter((id): id is string => typeof id === "string" && id.length > 0);

      const products = productIds.length > 0
        ? await tx.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, price: true, stock: true, available: true, status: true },
          })
        : [];
      const productMap = new Map(products.map((p) => [p.id, p]));

      let serverSubtotal = 0;

      for (const item of input.items) {
        if (!item.productId) continue;

        const product = productMap.get(item.productId);
        if (!product) {
          throw new OrderValidationError(`Product "${item.name}" no longer exists`);
        }
        if (!product.available || product.status !== "Active") {
          throw new OrderValidationError(`Product "${product.name}" is not available for purchase`);
        }
        if (product.stock < item.quantity) {
          throw new OrderValidationError(`Insufficient stock for "${product.name}": only ${product.stock} left, requested ${item.quantity}`);
        }
        serverSubtotal += parseMoney(product.price) * item.quantity;
      }

      let discountNum = 0;
      if (coupon) {
        if (serverSubtotal < parseMoney(coupon.minPurchase)) {
          throw new OrderValidationError(`Minimum purchase of ${coupon.minPurchase} required for this coupon`);
        }
        discountNum = parseMoney(coupon.discountAmount) || (coupon.discountPercent > 0 ? (serverSubtotal * coupon.discountPercent) / 100 : 0);
        const usage = await tx.coupon.updateMany({
          where: {
            id: coupon.id,
            ...(coupon.maxUsage > 0 ? { usageCount: { lt: coupon.maxUsage } } : {}),
          },
          data: { usageCount: { increment: 1 } },
        });
        if (usage.count === 0) {
          throw new OrderValidationError("Coupon usage limit reached");
        }
      }

      for (const item of input.items) {
        if (!item.productId) continue;
        const updateResult = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const available = product?.stock ?? 0;
          throw new OrderValidationError(`Insufficient stock for "${item.name}": only ${available} left, requested ${item.quantity}`);
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
            create: input.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              slug: item.slug ?? "",
              image: item.image ?? "",
              quantity: item.quantity,
              unitPrice: productMap.get(item.productId)?.price ?? "",
              totalPrice: formatMoney(parseMoney(productMap.get(item.productId)?.price ?? "0") * item.quantity),
            })),
          },
        },
        include: { items: true },
      });

      return created;
    });

    return { orderNumber, id: order.id };
  } catch (e) {
    if (e instanceof OrderValidationError) {
      return { error: e.message };
    }
    logError(e, "createOrder transaction failed");
    return { error: "Failed to create order. Please try again." };
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
  await prisma.order.update({ where: { id: orderId }, data: updateData });
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
