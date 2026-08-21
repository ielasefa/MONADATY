import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { generateInvoiceNumber, generateSignedToken, recordInvoiceEvent } from "@/lib/invoice";
import { isAuthenticated } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { sendInvoiceEmail } from "@/lib/email-invoice";
import QRCode from "qrcode";
import { randomUUID } from "crypto";
import { getAppUrl } from "@/lib/env-validator";
import { INVOICE_ROOT } from "@/lib/invoice-storage";

export async function POST(req: NextRequest) {
  const csrfError = requireOrigin(req);
  if (csrfError) return csrfError;

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let generatedPdfPath: string | null = null;
  let invoiceCommitted = false;

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) {
      return NextResponse.json({ error: "Invoice already exists for this order" }, { status: 409 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const storedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId ?? "",
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
        image: i.image ? new URL(i.image, getAppUrl()).toString() : "",
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

    const invoiceDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await fs.mkdir(INVOICE_ROOT, { recursive: true });
    // A concurrent invoice-number conflict must never let the losing request
    // unlink the winning request's file during cleanup.
    const pdfFilename = `${invoiceNumber}-${randomUUID()}.pdf`;
    const pdfPath = path.join(INVOICE_ROOT, pdfFilename);

    const qrDataUrl = await QRCode.toDataURL(invoiceNumber, {
      width: 200,
      margin: 1,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    const [{ renderToBuffer }, { InvoiceDocument }, React] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/admin/InvoicePDF"),
      import("react"),
    ]);

    const element = React.createElement(InvoiceDocument, {
      order: storedOrder,
      invoiceNumber,
      invoiceDate,
      qrDataUrl,
    });

    // Buffer rendering stays entirely in Node and avoids the Web Stream/Node
    // stream conversion that caused transformAlgorithm runtime failures.
    // @ts-expect-error - react-pdf types are narrower than its Node runtime API
    const pdfBuffer = Buffer.from(await renderToBuffer(element));
    await fs.writeFile(pdfPath, pdfBuffer);
    generatedPdfPath = pdfPath;

    const signedToken = generateSignedToken(invoiceNumber);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId,
        status: "Issued",
        pdfPath: `/invoices/${pdfFilename}`,
        signedToken,
      },
    });
    invoiceCommitted = true;

    const followUps = await Promise.allSettled([
      recordInvoiceEvent(invoice.id, "created", `Invoice ${invoiceNumber} created for order ${order.orderNumber}`),
      sendInvoiceEmail({
        to: order.customerEmail,
        customerName: order.customerName,
        invoiceNumber,
        invoicePath: `/invoices/${pdfFilename}`,
        orderNumber: order.orderNumber,
      }),
    ]);
    for (const result of followUps) {
      if (result.status === "rejected") logError(result.reason, "INVOICE_FOLLOW_UP");
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    if (generatedPdfPath && !invoiceCommitted) {
      await fs.unlink(generatedPdfPath).catch(() => undefined);
    }
    logError(error, "Failed to create invoice:");
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invoice already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
