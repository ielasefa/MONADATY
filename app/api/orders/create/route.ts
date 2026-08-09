import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createOrder, getOrderByIdempotencyKey } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { requireOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limiter";
import { logError } from "@/lib/logger";

const MOROCCAN_PHONE_REGEX = /^(\+212|0)([5-7]\d{8})$/;

export async function POST(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

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

    if (typeof idempotencyKey !== "string" || idempotencyKey.length < 12 || idempotencyKey.length > 200) {
      return NextResponse.json({ error: "Invalid checkout session", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // A retry is a lookup before it is a new write. This recovers an already committed order
    // even if a later city/stock check changed or the creation rate limit is now exhausted.
    const existingOrder = await getOrderByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      return NextResponse.json(
        {
          order: {
            id: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            total: existingOrder.total,
            orderStatus: existingOrder.orderStatus,
            paymentStatus: existingOrder.paymentStatus,
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimit(`order:create:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
        { status: 429 },
      );
    }
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json({ error: "Full name is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || !MOROCCAN_PHONE_REGEX.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Valid Moroccan phone number is required (+212 or 06/07)", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }
    if (!city || typeof city !== "string") {
      return NextResponse.json({ error: "City is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const dbCity = await prisma.city.findFirst({ where: { name: city, active: true } });
    if (!dbCity) {
      return NextResponse.json({ error: "Invalid city", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json({ error: "Delivery address is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    if (items.length > 50) {
      return NextResponse.json({ error: "Too many items in order", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    for (const item of items) {
      if (!item || typeof item !== "object") {
        return NextResponse.json({ error: "Invalid item in order", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    }
    if (postalCode && typeof postalCode === "string" && postalCode && !/^\d{5}$/.test(postalCode)) {
      return NextResponse.json({ error: "Invalid postal code format", code: "VALIDATION_ERROR" }, { status: 400 });
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
      const status = result.code === "OUT_OF_STOCK" || result.code === "PRODUCT_UNAVAILABLE" ? 409 : result.code === "ORDER_CREATE_FAILED" ? 500 : 400;
      return NextResponse.json({ error: result.error, code: result.code }, { status });
    }

    if (!result.replayed) {
      sendOrderConfirmationEmail({
        orderNumber: result.orderNumber,
        customerName: result.customerName,
        customerEmail: result.customerEmail,
        items: result.items,
        total: result.total,
        address: result.address,
        city: result.city,
      }).catch((e) => logError(e, "Failed to send confirmation email:"));
    }

    // Cache invalidation is follow-up work, never a reason to turn a committed order into a
    // checkout failure. All stock and admin surfaces receive fresh server data on navigation.
    try {
      revalidatePath("/admin/orders");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/collections");
      revalidatePath("/wishlist");
      revalidatePath("/product/[slug]", "page");
      revalidateTag("landing");
    } catch (e) {
      logError(e, "ORDER_REVALIDATE");
    }

    return NextResponse.json(
      {
        order: {
          id: result.id,
          orderNumber: result.orderNumber,
          total: result.total,
          orderStatus: result.orderStatus,
          paymentStatus: result.paymentStatus,
        },
      },
      {
        status: result.replayed ? 200 : 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (e) {
    logError(e, "ORDER_CREATE");
    return NextResponse.json(
      { error: "Failed to create order", code: "ORDER_CREATE_FAILED" },
      { status: 500 },
    );
  }
}
