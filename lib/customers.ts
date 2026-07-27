import { prisma } from "@/lib/prisma";

export interface CustomerData {
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

export type CustomerInfo = CustomerData;

export async function getCustomers(): Promise<CustomerData[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const grouped = new Map<string, CustomerData>();

  for (const o of orders) {
    const email = o.customerEmail;
    if (!email) continue;

    const nameParts = o.customerName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const existing = grouped.get(email);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += parseFloat(o.total.replace(/[^0-9.]/g, "")) || 0;
      existing.avgOrderValue = existing.totalSpent / existing.totalOrders;
      if (o.createdAt.toISOString() > existing.lastOrderDate) {
        existing.lastOrderDate = o.createdAt.toISOString();
        existing.lastOrderNumber = o.orderNumber;
      }
    } else {
      grouped.set(email, {
        email,
        name: o.customerName,
        firstName,
        lastName,
        phone: o.phone,
        city: o.city,
        address: o.address,
        postalCode: o.postalCode,
        totalOrders: 1,
        totalSpent: parseFloat(o.total.replace(/[^0-9.]/g, "")) || 0,
        avgOrderValue: 0,
        lastOrderNumber: o.orderNumber,
        lastOrderDate: o.createdAt.toISOString(),
        createdAt: o.createdAt.toISOString(),
      });
    }
  }

  const customers = Array.from(grouped.values());

  return customers.sort(
    (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
  );
}
