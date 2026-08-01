import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ReactPDF from "@react-pdf/renderer";
import path from "path";
import fs from "fs/promises";
import { generateInvoiceNumber, generateSignedToken, recordInvoiceEvent } from "@/lib/invoice";
import { InvoiceDocument } from "@/components/admin/InvoicePDF";
import React from "react";
import { isAuthenticated } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { sendInvoiceEmail } from "@/lib/email-invoice";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  const csrfError = requireOrigin(req);
  if (csrfError) return csrfError;

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const invoiceDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const invoicesDir = path.join(process.cwd(), "public", "invoices");
    await fs.mkdir(invoicesDir, { recursive: true });
    const pdfFilename = `${invoiceNumber}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFilename);

    const qrDataUrl = await QRCode.toDataURL(invoiceNumber, {
      width: 200,
      margin: 1,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    const element = React.createElement(InvoiceDocument, {
      order: storedOrder,
      invoiceNumber,
      invoiceDate,
      qrDataUrl,
    });

    // @ts-expect-error - react-pdf types expect DocumentProps but runtime works with any ReactElement
    const stream = await ReactPDF.renderToStream(element);
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: unknown) => chunks.push(Buffer.from(chunk as Buffer)));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
    await fs.writeFile(pdfPath, pdfBuffer);

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

    await recordInvoiceEvent(invoice.id, "created", `Invoice ${invoiceNumber} created for order ${order.orderNumber}`);

    await sendInvoiceEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      invoiceNumber,
      invoicePath: `/invoices/${pdfFilename}`,
      orderNumber: order.orderNumber,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    logError(error, "Failed to create invoice:");
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
