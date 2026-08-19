import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/data";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = page * limit;

    const orders = await getOrders({ take: limit, skip });

    return NextResponse.json(
      { orders },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  } catch (e) {
    logError(e, "list-orders error:");
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
