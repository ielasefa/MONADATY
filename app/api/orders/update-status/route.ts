import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { updateOrderStatus, getOrderById } from "@/lib/orders";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  const originError = requireOrigin(request);
  if (originError) return originError;

  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = (await request.json()) as {
      id: string;
      orderStatus?: string;
      paymentStatus?: string;
      estimatedDelivery?: string;
      actualDeliveryDate?: string;
      deliveryCompany?: string;
      trackingNumber?: string;
      deliveryNotes?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const existing = await getOrderById(body.id);
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updates: Record<string, string> = {};

    if (body.orderStatus !== undefined) {
      if (!ORDER_STATUSES.includes(body.orderStatus as typeof ORDER_STATUSES[number])) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
      }
      updates.orderStatus = body.orderStatus;
    }

    if (body.paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(body.paymentStatus as typeof PAYMENT_STATUSES[number])) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
      }
      updates.paymentStatus = body.paymentStatus;
    }

    if (body.estimatedDelivery !== undefined) {
      const ts = Date.parse(body.estimatedDelivery);
      if (isNaN(ts)) {
        return NextResponse.json({ error: "Invalid estimated delivery date" }, { status: 400 });
      }
      updates.estimatedDelivery = new Date(ts).toISOString();
    }

    if (body.actualDeliveryDate !== undefined) {
      const ts = Date.parse(body.actualDeliveryDate);
      if (isNaN(ts)) {
        return NextResponse.json({ error: "Invalid actual delivery date" }, { status: 400 });
      }
      updates.actualDeliveryDate = new Date(ts).toISOString();
    }

    if (body.deliveryCompany !== undefined) {
      updates.deliveryCompany = body.deliveryCompany;
    }

    if (body.trackingNumber !== undefined) {
      updates.trackingNumber = body.trackingNumber;
    }

    if (body.deliveryNotes !== undefined) {
      updates.deliveryNotes = body.deliveryNotes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await updateOrderStatus(body.id, updates);

    const admin = await getAuthenticatedAdmin();
    createAuditLog({
      adminId: admin?.id ?? "",
      action: "order_update",
      entity: `Order ${existing.orderNumber}`,
      entityId: body.id,
    });

    try {
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${body.id}`);
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/products");
      revalidatePath("/admin/inventory");
      revalidatePath("/success");
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/collections");
      revalidatePath("/wishlist");
      revalidatePath("/product/[slug]", "page");
      revalidateTag("landing");
    } catch (error) {
      logError(error, "ORDER_STATUS_REVALIDATE");
    }

    const updated = await getOrderById(body.id);

    return NextResponse.json({ order: updated });
  } catch (e) {
    logError(e, "ORDER_UPDATE_STATUS");
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
