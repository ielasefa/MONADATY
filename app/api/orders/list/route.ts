import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import { getOrders } from "@/lib/data";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  } catch (e) {
    logError(e, "list-orders error:");
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
