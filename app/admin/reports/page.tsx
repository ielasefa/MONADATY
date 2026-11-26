import { prisma } from "@/lib/prisma";
import { parseMoney } from "@/lib/money";
import { ReportsOverview } from "@/components/admin/ReportsOverview";

export const dynamic = "force-dynamic";

export default async function ReportsIndexPage() {
  let summary = { orderCount: 0, revenue: 0, productCount: 0, totalStock: 0 };

  try {
    const [orders, productCount, stock] = await Promise.all([
      prisma.order.findMany({
        where: {
          orderStatus: { notIn: ["cancelled", "refunded"] },
          paymentStatus: { not: "refunded" },
        },
        select: { total: true },
      }),
      prisma.product.count(),
      prisma.product.aggregate({ _sum: { stock: true } }),
    ]);

    summary = {
      orderCount: orders.length,
      revenue: orders.reduce((total, order) => total + parseMoney(order.total), 0),
      productCount,
      totalStock: stock._sum.stock ?? 0,
    };
  } catch (error) {
    console.error("Failed to load reports overview:", error);
  }

  return <ReportsOverview summary={summary} />;
}
