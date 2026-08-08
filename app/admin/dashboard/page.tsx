import type { Metadata } from "next";
import { loadProducts } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { getCollectionShowcaseStats } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { DashboardClient } from "./DashboardClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "dashboard", lang, "Tableau de bord") };
}

function parsePrice(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function toStoredOrder(order: {
  id: string; orderNumber: string; customerName: string; customerEmail: string;
  phone: string; address: string; city: string; postalCode: string; country: string;
  paymentMethod: string; paymentStatus: string; orderStatus: string; subtotal: string;
  shipping: string; shippingMethod: string; tax: string; total: string; currency: string;
  idempotencyKey: string; estimatedDelivery: string; actualDeliveryDate: string;
  deliveryCompany: string; trackingNumber: string; deliveryNotes: string;
  discountAmount: string;
  createdAt: Date; updatedAt: Date;
  items: { productId: string | null; name: string; slug: string; image: string; quantity: number; unitPrice: string; totalPrice: string }[];
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: "",
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    phone: order.phone,
    address: order.address,
    city: order.city,
    postalCode: order.postalCode,
    country: order.country,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus as "pending" | "paid" | "refunded",
    orderStatus: order.orderStatus as "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "completed" | "cancelled" | "refunded",
    subtotal: order.subtotal,
    shipping: order.shipping,
    shippingMethod: order.shippingMethod,
    tax: order.tax,
    total: order.total,
    currency: order.currency,
    items: order.items.map((i) => ({
      productId: i.productId ?? "",
      name: i.name,
      slug: i.slug,
      image: i.image,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
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
  const products = await loadProducts();
  const admin = await getAuthenticatedAdmin();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    paidOrderCount,
    refundedOrders,
    showcaseStats,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "pending" } }),
    prisma.order.count({ where: { orderStatus: "processing" } }),
    prisma.order.count({ where: { orderStatus: "delivered" } }),
    prisma.order.count({ where: { orderStatus: "cancelled" } }),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.order.count({ where: { paymentStatus: "refunded" } }),
    getCollectionShowcaseStats(),
  ]);

  const [paidOrders, paidOrdersToday, ordersTodayCount, paidOrdersMonth, ordersMonth, newCustomerCount] = await Promise.all([
    prisma.order.findMany({
      where: { paymentStatus: "paid" },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: todayStart } },
      select: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.findMany({
      where: { paymentStatus: "paid", createdAt: { gte: monthStart } },
      select: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.groupBy({
      by: ["customerEmail"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: true,
    }).then((rows) => rows.length),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + parsePrice(o.total), 0);
  const todayRevenue = paidOrdersToday.reduce((sum, o) => sum + parsePrice(o.total), 0);
  const revenueThisMonth = paidOrdersMonth.reduce((sum, o) => sum + parsePrice(o.total), 0);
  const ordersToday = ordersTodayCount;
  const ordersThisMonth = ordersMonth;

  const customerCount = await prisma.order.groupBy({
    by: ["customerEmail"],
    _count: true,
  }).then((rows) => rows.length);

  const latestCustomersRaw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true, customerEmail: true, phone: true, city: true,
      address: true, postalCode: true, orderNumber: true, total: true,
      createdAt: true,
    },
  });
  const customerMap = new Map<string, {
    email: string; name: string; firstName: string; lastName: string;
    phone: string; city: string; address: string; postalCode: string;
    totalOrders: number; totalSpent: number; avgOrderValue: number;
    lastOrderNumber: string; lastOrderDate: string; createdAt: string;
  }>();
  for (const o of latestCustomersRaw) {
    const existing = customerMap.get(o.customerEmail);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += parsePrice(o.total);
      existing.avgOrderValue = existing.totalSpent / existing.totalOrders;
      if (o.createdAt.toISOString() > existing.lastOrderDate) {
        existing.lastOrderDate = o.createdAt.toISOString();
        existing.lastOrderNumber = o.orderNumber;
      }
    } else {
      const parts = o.customerName.split(" ");
      customerMap.set(o.customerEmail, {
        email: o.customerEmail,
        name: o.customerName,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        phone: o.phone, city: o.city, address: o.address, postalCode: o.postalCode,
        totalOrders: 1,
        totalSpent: parsePrice(o.total),
        avgOrderValue: 0,
        lastOrderNumber: o.orderNumber,
        lastOrderDate: o.createdAt.toISOString(),
        createdAt: o.createdAt.toISOString(),
      });
    }
  }
  const latestCustomers = Array.from(customerMap.values())
    .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime())
    .slice(0, 5);

  const productCount = products.length;
  const lowStock = products.filter((p) => p.stock !== undefined && p.stock <= 5).length;

  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });
  const latestOrdersMapped = latestOrders.map(toStoredOrder);

  const recentPaidOrders = await prisma.order.findMany({
    where: { paymentStatus: "paid", createdAt: { gte: thirtyDaysAgo } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const revenueByDay: Record<string, number> = {};
  for (const o of recentPaidOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    revenueByDay[day] = (revenueByDay[day] || 0) + parsePrice(o.total);
  }
  const revenueChartData = Object.entries(revenueByDay).sort(([a], [b]) => a.localeCompare(b));

  const recentAllOrders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const ordersByDay: Record<string, number> = {};
  for (const o of recentAllOrders) {
    const day = o.createdAt.toISOString().slice(0, 10);
    ordersByDay[day] = (ordersByDay[day] || 0) + 1;
  }
  const ordersChartData = Object.entries(ordersByDay).sort(([a], [b]) => a.localeCompare(b));

  const topSellingAgg = await prisma.orderItem.groupBy({
    by: ["productId", "name"],
    where: { productId: { not: null } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const topProductIds = topSellingAgg.map((r) => r.productId).filter(Boolean) as string[];
  const topProductItems = topProductIds.length
    ? await prisma.orderItem.findMany({ where: { productId: { in: topProductIds } }, select: { productId: true, totalPrice: true } })
    : [];
  const totalByProduct = new Map<string, number>();
  for (const item of topProductItems) {
    if (item.productId) {
      totalByProduct.set(item.productId, (totalByProduct.get(item.productId) || 0) + parsePrice(item.totalPrice));
    }
  }
  const topProducts = topSellingAgg.map((row) => ({
    id: row.productId ?? "unknown",
    name: row.name,
    qty: row._sum.quantity ?? 0,
    total: totalByProduct.get(row.productId ?? "") ?? 0,
  }));

  const lowStockProducts = products
    .filter((p) => p.stock !== undefined && p.stock <= 5)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 5);

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const bestSelling = topProducts.length > 0 ? topProducts[0].name : null;

  const allPaidItems = await prisma.orderItem.findMany({
    where: { order: { paymentStatus: "paid" } },
    select: { productId: true, totalPrice: true },
  });
  const collProductIds = [...new Set(allPaidItems.map((i) => i.productId).filter(Boolean) as string[])];
  const collProducts = collProductIds.length
    ? await prisma.product.findMany({
        where: { id: { in: collProductIds } },
        select: { id: true, collectionId: true },
      })
    : [];
  const collMap = new Map(collProducts.map((p) => [p.id, p.collectionId]));
  const collectionRevenue = new Map<string, number>();
  for (const item of allPaidItems) {
    const pid = item.productId;
    if (!pid) continue;
    const collId = collMap.get(pid);
    if (collId) {
      collectionRevenue.set(collId, (collectionRevenue.get(collId) || 0) + parsePrice(item.totalPrice));
    }
  }
  const collections = await prisma.collection.findMany({ select: { id: true, name: true } });
  const collectionMap = new Map(collections.map((c) => [c.id, c.name]));
  const collectionSalesData = Array.from(collectionRevenue.entries())
    .map(([id, rev]) => ({ name: collectionMap.get(id) ?? "Unknown", value: Math.round(rev) }))
    .sort((a, b) => b.value - a.value);

  const showcaseCollections = collections.map((c) => ({
    id: c.id,
    name: c.name,
    configured: showcaseStats.perCollection[c.id] ?? 0,
  }));

  let bestCollection: string | null = null;
  let bestCollectionValue = 0;
  for (const cs of collectionSalesData) {
    if (cs.value > bestCollectionValue) {
      bestCollectionValue = cs.value;
      bestCollection = cs.name;
    }
  }

  const monthlyRevenueData: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const ms = await prisma.order.findMany({
      select: { total: true },
      where: { paymentStatus: "paid", createdAt: { gte: m, lt: mEnd } },
    });
    const monthRevenue = ms.reduce((sum, o) => sum + parsePrice(o.total), 0);
    monthlyRevenueData.push({
      month: m.toLocaleString("en-US", { month: "short" }),
      revenue: monthRevenue,
    });
  }

  const kpiRevenueData = revenueChartData.map(([date, revenue]) => ({ date, revenue }));
  const kpiOrdersData = ordersChartData.map(([date, orders]) => ({ date, orders }));
  const topProductsChart = topProducts.map((p) => ({ name: p.name, value: p.qty }));

  return (
    <div className="min-h-screen bg-bg">
      <div className="container-shell mx-auto px-6 py-10">
        <DashboardClient
          adminName={admin?.name ?? null}
          totalOrders={totalOrders}
          totalRevenue={totalRevenue}
          todayRevenue={todayRevenue}
          revenueThisMonth={revenueThisMonth}
          ordersToday={ordersToday}
          ordersThisMonth={ordersThisMonth}
          customerCount={customerCount}
          newCustomers30Days={newCustomerCount}
          pendingOrders={pendingOrders}
          processingOrders={processingOrders}
          deliveredOrders={deliveredOrders}
          cancelledOrders={cancelledOrders}
          paidOrders={paidOrderCount}
          refundedOrders={refundedOrders}
          productCount={productCount}
          lowStock={lowStock}
          lowStockProducts={lowStockProducts}
          latestOrders={latestOrdersMapped}
          latestCustomers={latestCustomers}
          topProducts={topProducts}
          averageOrderValue={averageOrderValue}
          bestSellingProduct={bestSelling}
          bestCollection={bestCollection}
          revenueChartData={kpiRevenueData}
          ordersChartData={kpiOrdersData}
          topProductsChart={topProductsChart}
          collectionSalesData={collectionSalesData}
          monthlyRevenueData={monthlyRevenueData}
          showcaseStats={{
            configuredCollections: showcaseStats.configuredCollections,
            configuredProducts: showcaseStats.configuredProducts,
            totalCollections: collections.length,
          }}
          showcaseCollections={showcaseCollections}
        />
      </div>
    </div>
  );
}
