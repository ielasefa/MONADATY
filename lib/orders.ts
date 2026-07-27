import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { logError } from "./logger";

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

export async function createOrder(input: OrderCreateInput): Promise<{ orderNumber: string; id: string } | { error: string }> {
  const key = input.idempotencyKey ?? crypto.randomUUID();

  const existing = await prisma.order.findUnique({ where: { idempotencyKey: key } });
  if (existing) {
    return { orderNumber: existing.orderNumber, id: existing.id };
  }

  const orderNumber = `MON-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  let discountAmount = "0.00 DH";

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
    if (!coupon || !coupon.isActive) {
      return { error: "Invalid or expired coupon code" };
    }
    if (coupon.maxUsage > 0 && coupon.usageCount >= coupon.maxUsage) {
      return { error: "Coupon usage limit reached" };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { error: "Coupon has expired" };
    }
    const subtotalNum = parseFloat(input.subtotal.replace(/[^0-9.]/g, "")) || 0;
    const minPurchaseNum = parseFloat(coupon.minPurchase.replace(/[^0-9.]/g, "")) || 0;
    if (subtotalNum < minPurchaseNum) {
      return { error: `Minimum purchase of ${coupon.minPurchase} required for this coupon` };
    }
    discountAmount = coupon.discountAmount;

    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usageCount: { increment: 1 } },
    });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of input.items) {
        if (!item.productId) continue;
        const updateResult = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const available = product?.stock ?? 0;
          throw new Error(`Insufficient stock for "${item.name}": only ${available} left, requested ${item.quantity}`);
        }
      }

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
          subtotal: input.subtotal,
          shipping: input.shipping,
          shippingMethod: input.shippingMethod,
          tax: input.tax,
          total: input.total,
          couponCode: input.couponCode ?? null,
          discountAmount,
          idempotencyKey: key,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              name: item.name,
              slug: item.slug ?? "",
              image: item.image ?? "",
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: { items: true },
      });

      return created;
    });

    return { orderNumber, id: order.id };
  } catch (e) {
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
