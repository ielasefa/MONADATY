import { prisma } from "./prisma";

function parsePrice(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

export async function getSalesReport(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to }, paymentStatus: "paid" },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  const totalSales = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + parsePrice(o.total), 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  const dailyData: Record<string, { sales: number; revenue: number; orders: number }> = {};
  for (const o of orders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!dailyData[day]) dailyData[day] = { sales: 0, revenue: 0, orders: 0 };
    dailyData[day].sales += o.items.reduce((s, i) => s + i.quantity, 0);
    dailyData[day].revenue += parsePrice(o.total);
    dailyData[day].orders += 1;
  }

  return {
    totalSales,
    totalRevenue,
    totalItems,
    avgOrderValue,
    dailyData: Object.entries(dailyData).map(([date, data]) => ({ date, ...data })),
  };
}

export async function getRevenueReport(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to }, paymentStatus: "paid" },
    orderBy: { createdAt: "asc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + parsePrice(o.total), 0);
  const subtotalRevenue = orders.reduce((sum, o) => sum + parsePrice(o.subtotal), 0);
  const shippingRevenue = orders.reduce((sum, o) => sum + parsePrice(o.shipping), 0);
  const discountTotal = orders.reduce((sum, o) => sum + parsePrice(o.discountAmount), 0);

  const monthlyData: Record<string, number> = {};
  for (const o of orders) {
    const month = o.createdAt.toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + parsePrice(o.total);
  }

  return {
    totalRevenue,
    subtotalRevenue,
    shippingRevenue,
    discountTotal,
    netRevenue: totalRevenue - discountTotal,
    monthlyData: Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue })),
  };
}

export async function getProfitReport(from: Date, to: Date) {
  const products = await prisma.product.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { name: true, price: true, costPrice: true, stock: true },
  });

  const totalRevenue = products.reduce((sum, p) => sum + parsePrice(p.price) * p.stock, 0);
  const totalCost = products.reduce((sum, p) => sum + parsePrice(p.costPrice) * p.stock, 0);
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return { totalRevenue, totalCost, profit, margin: Math.round(margin * 100) / 100 };
}

export async function getCustomersReport(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { customerEmail: true, customerName: true, total: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const customerMap = new Map<string, { name: string; orders: number; total: number; firstOrder: Date; lastOrder: Date }>();
  for (const o of orders) {
    const existing = customerMap.get(o.customerEmail);
    if (existing) {
      existing.orders++;
      existing.total += parsePrice(o.total);
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      customerMap.set(o.customerEmail, {
        name: o.customerName,
        orders: 1,
        total: parsePrice(o.total),
        firstOrder: o.createdAt,
        lastOrder: o.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.entries()).map(([email, data]) => ({ email, ...data }));
  const totalCustomers = customers.length;
  const avgOrdersPerCustomer = totalCustomers > 0 ? customers.reduce((s, c) => s + c.orders, 0) / totalCustomers : 0;
  const avgSpentPerCustomer = totalCustomers > 0 ? customers.reduce((s, c) => s + c.total, 0) / totalCustomers : 0;

  return { totalCustomers, avgOrdersPerCustomer, avgSpentPerCustomer, customers };
}

export async function getOrdersReport(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts: Record<string, number> = {};
  const paymentCounts: Record<string, number> = {};
  for (const o of orders) {
    statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
    paymentCounts[o.paymentStatus] = (paymentCounts[o.paymentStatus] || 0) + 1;
  }

  return {
    totalOrders: orders.length,
    statusCounts,
    paymentCounts,
    orders: orders.map(o => ({
      number: o.orderNumber,
      customer: o.customerName,
      total: o.total,
      status: o.orderStatus,
      payment: o.paymentStatus,
      date: o.createdAt.toISOString(),
    })),
  };
}

export async function getProductsReport(from: Date, to: Date) {
  const items = await prisma.orderItem.findMany({
    where: {
      order: { createdAt: { gte: from, lte: to }, paymentStatus: "paid" },
    },
    select: { name: true, quantity: true, totalPrice: true, productId: true },
  });

  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of items) {
    const key = item.productId ?? item.name;
    const existing = productMap.get(key);
    if (existing) {
      existing.qty += item.quantity;
      existing.revenue += parsePrice(item.totalPrice);
    } else {
      productMap.set(key, { name: item.name, qty: item.quantity, revenue: parsePrice(item.totalPrice) });
    }
  }

  const products = Array.from(productMap.values()).sort((a, b) => b.qty - a.qty);
  return { totalProducts: products.length, products };
}
