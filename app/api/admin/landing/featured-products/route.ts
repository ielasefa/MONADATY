import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { logError } from "@/lib/logger";
import { FeaturedSelectionError, parseFeaturedProductIds, saveFeaturedSelection } from "@/lib/featured-selection";

export async function PUT(request: Request) {
  const originError = requireOrigin(request);
  if (originError) return originError;
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { productIds?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "SELECT_FOUR_PRODUCTS" }, { status: 400 }); }
  try {
    const ids = parseFeaturedProductIds(body?.productIds);
    await saveFeaturedSelection(ids, admin.name);
    revalidateTag("landing");
    revalidatePath("/");
    revalidatePath("/admin/landing");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof FeaturedSelectionError) {
      return NextResponse.json({ error: error.reason }, { status: 400 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2034") {
      return NextResponse.json({ error: "SAVE_CONFLICT" }, { status: 409 });
    }
    logError(error, "Save homepage featured products");
    return NextResponse.json({ error: "SAVE_FAILED" }, { status: 500 });
  }
}
