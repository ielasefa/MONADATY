import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, getOrderByNumber } from "@/lib/orders";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const id = request.nextUrl.searchParams.get("id");
    const orderNumber = request.nextUrl.searchParams.get("orderNumber");

    if (!id && !orderNumber) {
      return NextResponse.json({ error: "Order ID or order number is required" }, { status: 400 });
    }

    const order = id ? await getOrderById(id) : orderNumber ? await getOrderByNumber(orderNumber) : undefined;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (e) {
    logError(e, "get-order error:");
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
