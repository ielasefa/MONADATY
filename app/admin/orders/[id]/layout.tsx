import { prisma } from "@/lib/prisma";
import { getOrderById } from "@/lib/orders";
import { OrderDetailInitialDataProvider } from "./OrderDetailInitialData";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, invoice] = await Promise.all([
    getOrderById(id),
    prisma.invoice.findUnique({ where: { orderId: id } }),
  ]);

  return (
    <OrderDetailInitialDataProvider
      order={order}
      invoice={invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        status: invoice.status,
        pdfPath: invoice.pdfPath,
        createdAt: invoice.createdAt.toISOString(),
      } : null}
    >
      {children}
    </OrderDetailInitialDataProvider>
  );
}
