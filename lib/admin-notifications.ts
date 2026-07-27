"use server";

import { prisma } from "@/lib/prisma";

export type AdminNotificationType = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
};

export async function getNotifications(): Promise<AdminNotificationType[]> {
  return prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function getUnreadCount(): Promise<number> {
  return prisma.adminNotification.count({ where: { read: false } });
}

export async function markAsRead(id: string): Promise<void> {
  await prisma.adminNotification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(): Promise<void> {
  await prisma.adminNotification.updateMany({
    where: { read: false },
    data: { read: true },
  });
}

export async function createNotification(
  type: string,
  title: string,
  message: string,
  link: string = "",
): Promise<void> {
  await prisma.adminNotification.create({
    data: { type, title, message, link },
  });
}

export async function ensureOrderNotifications(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const existing = await prisma.adminNotification.findFirst({
    where: { type: "new_order", message: { contains: order.orderNumber } },
  });
  if (existing) return;

  await prisma.adminNotification.create({
    data: {
      type: "new_order",
      title: "New Order",
      message: `Order ${order.orderNumber} — ${order.customerName} — ${order.total}`,
      link: `/admin/orders/${order.id}`,
    },
  });

  if (order.paymentStatus === "paid") {
    await prisma.adminNotification.create({
      data: {
        type: "payment_received",
        title: "Payment Received",
        message: `Payment for order ${order.orderNumber} — ${order.total}`,
        link: `/admin/orders/${order.id}`,
      },
    });
  }
}

export async function ensureLowStockNotifications(): Promise<void> {
  const products = await prisma.product.findMany({
    where: { stock: { lte: 10 }, available: true },
    select: { id: true, name: true, stock: true },
  });

  for (const p of products) {
    const existing = await prisma.adminNotification.findFirst({
      where: { type: "low_stock", message: { contains: p.name } },
    });
    if (existing) continue;

    await prisma.adminNotification.create({
      data: {
        type: "low_stock",
        title: p.stock === 0 ? "Out of Stock" : "Low Stock",
        message: `${p.name} — ${p.stock} remaining`,
        link: `/admin/shop`,
      },
    });
  }
}
