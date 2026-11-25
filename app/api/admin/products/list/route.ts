import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { getAdminProductPage } from "@/lib/admin-product-query";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = request.nextUrl;

    return NextResponse.json(await getAdminProductPage(searchParams), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    logError(err, "Failed to fetch products:");
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
