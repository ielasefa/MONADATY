import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { authGuard } from "@/lib/inventory-api";
import { adjustProductStock, ProductStockError } from "@/lib/product-stock";
import { logError } from "@/lib/logger";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authGuard(request);
  if (guard instanceof NextResponse) return guard;
  let body: { delta?: unknown; operationId?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON", code: "INVALID_ADJUSTMENT" }, { status: 400 }); }
  if (!body || typeof body.delta !== "number" || typeof body.operationId !== "string") return NextResponse.json({ error: "Invalid adjustment", code: "INVALID_ADJUSTMENT" }, { status: 400 });
  try {
    const { id } = await params;
    const result = await adjustProductStock({ productId: id, delta: body.delta, operationId: body.operationId, adminId: guard.admin.id, adminName: guard.admin.name });
    try {
      revalidateTag("landing");
      for (const path of ["/", "/shop", "/collections", "/wishlist", "/admin/products", "/admin/dashboard", "/admin/inventory"]) revalidatePath(path);
      revalidatePath("/product/[id]", "page");
    } catch (error) { logError(error, "STOCK_REVALIDATE"); }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProductStockError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    logError(error, "PRODUCT_STOCK_ADJUSTMENT");
    return NextResponse.json({ error: "Failed to adjust stock", code: "STOCK_UPDATE_FAILED" }, { status: 500 });
  }
}
