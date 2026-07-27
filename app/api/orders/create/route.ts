import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createOrder, getOrderByNumber } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { requireOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";

const MOROCCAN_PHONE_REGEX = /^(\+212|0)([5-7]\d{8})$/;

export async function POST(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimit(`order:create:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const {
      customerName,
      customerEmail,
      phone,
      city,
      address,
      items,
      idempotencyKey,
      subtotal,
      shipping,
      shippingMethod,
      tax,
      total,
      postalCode,
      couponCode,
    } = body as Record<string, unknown>;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !MOROCCAN_PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ error: "Valid Moroccan phone number is required (+212 or 06/07)" }, { status: 400 });
    }
    if (!city || typeof city !== "string") {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }
    const dbCity = await prisma.city.findFirst({ where: { name: city, active: true } });
    if (!dbCity) {
      return NextResponse.json({ error: "Invalid city" }, { status: 400 });
    }
    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }
    if (postalCode && typeof postalCode === "string" && postalCode && !/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: "Invalid postal code format" }, { status: 400 });
    }

    const result = await createOrder({
      customerName: customerName as string,
      customerEmail: customerEmail as string,
      phone: phone as string,
      address: address as string,
      city: city as string,
      postalCode: (postalCode as string) ?? "",
      country: "Morocco",
      subtotal: subtotal as string,
      shipping: (shipping as string) ?? "0.00 DH",
      shippingMethod: (shippingMethod as string) ?? "delivery",
      tax: tax as string,
      total: total as string,
      items: (items as Array<{
        productId: string;
        name: string;
        slug?: string;
        image?: string;
        quantity: number;
        unitPrice: string;
        totalPrice: string;
      }>).map((item) => ({
        productId: item.productId,
        name: item.name,
        slug: item.slug ?? "",
        image: item.image ?? "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      idempotencyKey: idempotencyKey as string,
      couponCode: (couponCode as string) ?? undefined,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const order = await getOrderByNumber(result.orderNumber);
    if (order) {
      sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items.map((i: { name: string; quantity: number; unitPrice: string }) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
        total: order.total,
        address: order.address,
        city: order.city,
      }).catch((e) => logError(e, "Failed to send confirmation email:"));
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");

    return NextResponse.json({ order: result }, { status: 201 });
  } catch (e) {
    logError(e, "ORDER_CREATE");
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
