import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { getCollectionShowcaseStats } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { resolveDatabaseProductImage } from "@/lib/product-images";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "dashboard", lang, "Tableau de bord") };
}

function parsePrice(value: string | null): number {
  if (!value) return 0;
  return Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

function toStoredOrder(order: {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
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
  items: Array<{
    productId: string | null;
    name: string;
    slug: string;
    image: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId ?? undefined,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    phone: order.phone,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus as "pending" | "paid" | "refunded",
    orderStatus: order.orderStatus as
      | "pending"
      | "processing"
      | "shipped"
      | "out_for_delivery"
      | "delivered"
      | "completed"
      | "cancelled"
      | "refunded",
    subtotal: order.subtotal,
    shipping: order.shipping,
    shippingMethod: order.shippingMethod,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    items: order.items.map((item) => ({
      productId: item.productId ?? "",
      name: item.name,
      slug: item.slug,
      image: item.image,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    idempotencyKey: order.idempotencyKey,
    estimatedDelivery: order.estimatedDelivery,
    actualDeliveryDate: order.actualDeliveryDate,
    deliveryCompany: order.deliveryCompany,
    trackingNumber: order.trackingNumber,
    deliveryNotes: order.deliveryNotes,
    discountAmount: order.discountAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Independent reads run together. The dashboard is force-dynamic, so this is canonical
  // database data on every navigation without a client-side loading race.
  const [
    admin,
    products,
    orderStatusRows,
    paymentStatusRows,
    ordersToday,
    ordersThisMonth,
    paidOrders,
    recentOrders,
    customerOrders,
    latestOrders,
    salesItems,
    collections,
    showcaseStats,
  ] = await Promise.all([
    getAuthenticatedAdmin(),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        status: true,
        collectionId: true,
        image: true,
        gallery: true,
        images: { select: { url: true, isCover: true, sortOrder: true } },
      },
    }),
    prisma.order.groupBy({ by: ["orderStatus"], _count: { _all: true } }),
    prisma.order.groupBy({ by: ["paymentStatus"], _count: { _all: true } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid" },
      select: { total: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, customerEmail: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        customerName: true,
        customerEmail: true,
        phone: true,
        city: true,
        address: true,
        postalCode: true,
        orderNumber: true,
        total: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    prisma.orderItem.findMany({
      where: {
        productId: { not: null },
        order: { orderStatus: { notIn: ["cancelled", "refunded"] } },
      },
      select: { orderId: true, productId: true, name: true, quantity: true, totalPrice: true },
    }),
    prisma.collection.findMany({ select: { id: true, name: true } }),
    getCollectionShowcaseStats(),
  ]);

  const orderCounts = new Map(orderStatusRows.map((row) => [row.orderStatus, row._count._all]));
  const paymentCounts = new Map(paymentStatusRows.map((row) => [row.paymentStatus, row._count._all]));
  const totalOrders = orderStatusRows.reduce((sum, row) => sum + row._count._all, 0);
  const paidOrderCount = paymentCounts.get("paid") ?? 0;

  const totalRevenue = paidOrders.reduce((sum, order) => sum + parsePrice(order.total), 0);
  const todayRevenue = paidOrders
    .filter((order) => order.createdAt >= todayStart)
    .reduce((sum, order) => sum + parsePrice(order.total), 0);
  const revenueThisMonth = paidOrders
    .filter((order) => order.createdAt >= monthStart)
    .reduce((sum, order) => sum + parsePrice(order.total), 0);

  const recentCustomerEmails = new Set(recentOrders.map((order) => order.customerEmail));
  const customerMap = new Map<
    string,
    {
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      phone: string;
      city: string;
      address: string;
      postalCode: string;
      totalOrders: number;
      totalSpent: number;
      avgOrderValue: number;
      lastOrderNumber: string;
      lastOrderDate: string;
      createdAt: string;
    }
  >();

  for (const order of customerOrders) {
    const amount = parsePrice(order.total);
    const existing = customerMap.get(order.customerEmail);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += amount;
      existing.avgOrderValue = existing.totalSpent / existing.totalOrders;
      continue;
    }

    const parts = order.customerName.trim().split(/\s+/);
    customerMap.set(order.customerEmail, {
      email: order.customerEmail,
      name: order.customerName,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      phone: order.phone,
      city: order.city,
      address: order.address,
      postalCode: order.postalCode,
      totalOrders: 1,
      totalSpent: amount,
      avgOrderValue: amount,
      lastOrderNumber: order.orderNumber,
      lastOrderDate: order.createdAt.toISOString(),
      createdAt: order.createdAt.toISOString(),
    });
  }

  const latestCustomers = [...customerMap.values()].slice(0, 5);

  const activeInventoryProducts = products.filter((product) => product.status !== "Archived");
  const allLowStockProducts = activeInventoryProducts.filter(
    (product) => product.stock <= product.lowStockThreshold,
  );
  const lowStockProducts = allLowStockProducts
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5)
    .map((product) => ({ id: product.id, name: product.name, stock: product.stock }));

  const productMap = new Map(products.map((product) => [product.id, product]));
  const salesByProduct = new Map<string, { id: string; name: string; qty: number; total: number }>();
  for (const item of salesItems) {
    if (!item.productId) continue;
    const current = salesByProduct.get(item.productId) ?? {
      id: item.productId,
      name: item.name,
      qty: 0,
      total: 0,
    };
    current.qty += item.quantity;
    current.total += parsePrice(item.totalPrice);
    salesByProduct.set(item.productId, current);
  }

  const topProducts = [...salesByProduct.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)
    .map((product) => {
      const databaseProduct = productMap.get(product.id);
      return {
        ...product,
        image: databaseProduct ? resolveDatabaseProductImage(databaseProduct) : "",
      };
    });

  const collectionRevenue = new Map<string, number>();
  const collectionOrders = new Map<string, Set<string>>();
  for (const item of salesItems) {
    if (!item.productId) continue;
    const collectionId = productMap.get(item.productId)?.collectionId;
    if (!collectionId) continue;
    collectionRevenue.set(collectionId, (collectionRevenue.get(collectionId) ?? 0) + parsePrice(item.totalPrice));
    const orders = collectionOrders.get(collectionId) ?? new Set<string>();
    orders.add(item.orderId);
    collectionOrders.set(collectionId, orders);
  }

  const collectionMap = new Map(collections.map((collection) => [collection.id, collection.name]));
  const collectionSalesData = [...collectionRevenue.entries()]
    .map(([id, value]) => ({ name: collectionMap.get(id) ?? "Unknown", value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
  const bestCollectionEntry = [...collectionRevenue.entries()].sort((a, b) => b[1] - a[1])[0];
  const bestCollection = bestCollectionEntry
    ? {
        name: collectionMap.get(bestCollectionEntry[0]) ?? "Unknown",
        revenue: bestCollectionEntry[1],
        orders: collectionOrders.get(bestCollectionEntry[0])?.size ?? 0,
      }
    : null;

  const revenueByDay = new Map<string, number>();
  for (const order of paidOrders) {
    if (order.createdAt < thirtyDaysAgo) continue;
    const day = order.createdAt.toISOString().slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + parsePrice(order.total));
  }
  const ordersByDay = new Map<string, number>();
  for (const order of recentOrders) {
    const day = order.createdAt.toISOString().slice(0, 10);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
  }

  const monthlyRevenueData: Array<{ month: string; revenue: number }> = [];
  for (let index = 5; index >= 0; index -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - index + 1, 1);
    const revenue = paidOrders
      .filter((order) => order.createdAt >= month && order.createdAt < monthEnd && order.createdAt >= sixMonthsStart)
      .reduce((sum, order) => sum + parsePrice(order.total), 0);
    monthlyRevenueData.push({
      month: month.toLocaleString("en-US", { month: "short" }),
      revenue,
    });
  }

  return (
    <div className="container-shell">
      <DashboardClient
        adminName={admin?.name ?? null}
        totalOrders={totalOrders}
        totalRevenue={totalRevenue}
        todayRevenue={todayRevenue}
        revenueThisMonth={revenueThisMonth}
        ordersToday={ordersToday}
        ordersThisMonth={ordersThisMonth}
        customerCount={customerMap.size}
        newCustomers30Days={recentCustomerEmails.size}
        pendingOrders={orderCounts.get("pending") ?? 0}
        processingOrders={orderCounts.get("processing") ?? 0}
        deliveredOrders={orderCounts.get("delivered") ?? 0}
        cancelledOrders={orderCounts.get("cancelled") ?? 0}
        paidOrders={paidOrderCount}
        refundedOrders={paymentCounts.get("refunded") ?? 0}
        productCount={products.length}
        lowStock={allLowStockProducts.length}
        lowStockProducts={lowStockProducts}
        latestOrders={latestOrders.map(toStoredOrder)}
        latestCustomers={latestCustomers}
        topProducts={topProducts}
        averageOrderValue={paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0}
        bestSellingProduct={topProducts[0] ?? null}
        bestCollection={bestCollection}
        revenueChartData={[...revenueByDay.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([date, revenue]) => ({ date, revenue }))}
        ordersChartData={[...ordersByDay.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([date, orders]) => ({ date, orders }))}
        topProductsChart={topProducts.map((product) => ({ name: product.name, value: product.qty }))}
        collectionSalesData={collectionSalesData}
        monthlyRevenueData={monthlyRevenueData}
        showcaseStats={{
          configuredCollections: showcaseStats.configuredCollections,
          configuredProducts: showcaseStats.configuredProducts,
          totalCollections: collections.length,
        }}
        showcaseCollections={collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          configured: showcaseStats.perCollection[collection.id] ?? 0,
        }))}
      />
    </div>
  );
}
