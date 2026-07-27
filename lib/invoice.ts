import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import crypto from "crypto";

const TOKEN_SECRET = process.env.SESSION_SECRET || "invoice-secret-change-in-production";

export async function generateInvoiceNumber(): Promise<string> {
  const last = await prisma.invoice.findFirst({
    orderBy: { createdAt: "desc" },
    select: { invoiceNumber: true },
  });

  let nextNum = 1;
  if (last) {
    const match = last.invoiceNumber.match(/MON-INV-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `MON-INV-${String(nextNum).padStart(6, "0")}`;
}

export async function generateCreditNoteNumber(): Promise<string> {
  const last = await prisma.creditNote.findFirst({
    orderBy: { createdAt: "desc" },
    select: { creditNoteNumber: true },
  });

  let nextNum = 1;
  if (last) {
    const match = last.creditNoteNumber.match(/MON-CN-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  return `MON-CN-${String(nextNum).padStart(6, "0")}`;
}

export async function getInvoiceForOrder(orderId: string) {
  return prisma.invoice.findUnique({
    where: { orderId },
    include: { events: { orderBy: { createdAt: "desc" } } },
  });
}

export function generateSignedToken(invoiceNumber: string): string {
  const payload = `${invoiceNumber}:${Date.now()}`;
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
  hmac.update(payload);
  return `${Buffer.from(payload).toString("base64url")}.${hmac.digest("hex")}`;
}

export function verifySignedToken(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
  hmac.update(Buffer.from(payloadB64, "base64url").toString());
  const expected = hmac.digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  const payload = Buffer.from(payloadB64, "base64url").toString();
  const [invoiceNumber] = payload.split(":");
  return invoiceNumber || null;
}

export async function recordInvoiceEvent(
  invoiceId: string,
  event: string,
  metadata: string = "",
  ip: string = "",
): Promise<void> {
  await prisma.invoiceEvent.create({
    data: { invoiceId, event, metadata, ip },
  });
}

export async function getInvoicesList(params: {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortField?: string;
  sortDir?: "asc" | "desc";
}) {
  const { search, status, page, pageSize, sortField = "createdAt", sortDir = "desc" } = params;

  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search } },
      { order: { customerName: { contains: search } } },
      { order: { orderNumber: { contains: search } } },
      { order: { customerEmail: { contains: search } } },
    ];
  }

  const allowedSortFields = ["createdAt", "invoiceNumber", "status", "total"];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : "createdAt";
  const orderBy: Prisma.InvoiceOrderByWithRelationInput = { [safeSortField]: sortDir };

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where: where as Prisma.InvoiceWhereInput }),
    prisma.invoice.findMany({
      where: where as Prisma.InvoiceWhereInput,
      include: {
        order: { select: { orderNumber: true, customerName: true, customerEmail: true, total: true, createdAt: true } },
        events: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy,
      skip: page * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, invoices, totalPages: Math.ceil(total / pageSize) };
}

export type InvoiceWithOrder = Awaited<ReturnType<typeof getInvoicesList>>["invoices"][0];
