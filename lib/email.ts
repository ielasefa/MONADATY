import { Resend } from "resend";
import { getEmailTemplate } from "@/lib/db";
import { logInfo, logError } from "./logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "";

type OrderInfo = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; unitPrice: string }>;
  total: string;
  address: string;
  city: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  deliveryCompany?: string;
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function fillTemplate(template: string, order: OrderInfo, statusLabel: string, message: string): string {
  const itemsHtml = order.items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${i.name}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${i.unitPrice}</td></tr>`)
    .join("");
  return template
    .replace(/\{\{statusLabel\}\}/g, escapeHtml(statusLabel))
    .replace(/\{\{customerName\}\}/g, escapeHtml(order.customerName))
    .replace(/\{\{message\}\}/g, escapeHtml(message))
    .replace(/\{\{orderNumber\}\}/g, escapeHtml(order.orderNumber))
    .replace(/\{\{itemsHtml\}\}/g, itemsHtml)
    .replace(/\{\{total\}\}/g, escapeHtml(order.total))
    .replace(/\{\{address\}\}/g, escapeHtml(order.address))
    .replace(/\{\{city\}\}/g, escapeHtml(order.city))
    .replace(/\{\{estimatedDelivery\}\}/g, escapeHtml(order.estimatedDelivery || ""))
    .replace(/\{\{trackingNumber\}\}/g, escapeHtml(order.trackingNumber || ""))
    .replace(/\{\{deliveryCompany\}\}/g, escapeHtml(order.deliveryCompany || ""));
}

async function sendEmail(templateKey: string, order: OrderInfo, statusLabel: string, message: string): Promise<void> {
  if (!resend || !FROM_EMAIL) {
    logInfo("Email: RESEND_API_KEY or EMAIL_FROM not set, skipping email for order " + order.orderNumber);
    return;
  }
  try {
    const tmpl = await getEmailTemplate(templateKey);
    const subject = tmpl?.subject
      ? tmpl.subject.replace(/\{\{orderNumber\}\}/g, order.orderNumber).replace(/\{\{statusLabel\}\}/g, statusLabel)
      : `Order ${statusLabel} — ${order.orderNumber}`;
    const htmlBody = tmpl?.body
      ? fillTemplate(tmpl.body, order, statusLabel, message)
      : `<p>${escapeHtml(message)}</p>`;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html: htmlBody,
    });
  } catch (e) {
    logError(e, `Failed to send ${templateKey} email`);
  }
}

export async function sendOrderConfirmationEmail(order: OrderInfo): Promise<void> {
  await sendEmail("confirmation", order, "Order Confirmed", "Thank you for your order! We've received it and our team has started preparing your package.");
}

export async function sendOrderStatusEmail(order: OrderInfo, status: string): Promise<void> {
  const labels: Record<string, string> = {
    processing: "Processing",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  const messages: Record<string, string> = {
    processing: "Great news! Your order is now being processed. Our team is carefully preparing your items for shipment.",
    shipped: "Your order has been shipped and is on its way! We'll notify you when it's out for delivery.",
    out_for_delivery: "Your package is out for delivery today! Please ensure someone is available to receive it.",
    delivered: "Your order has been delivered! We hope you enjoy your experience.",
    completed: "Your order has been completed. Thank you for choosing us!",
    cancelled: "Your order has been cancelled. If you have any questions, please contact our support team.",
    refunded: "Your refund has been processed. The amount will be credited to your original payment method.",
  };
  const label = labels[status] ?? status;
  const message = messages[status] ?? `Your order status has been updated to ${status}.`;
  await sendEmail(status, order, label, message);
}
