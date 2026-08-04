import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { saveSectionOrder } from "@/lib/landing-cms";
import { revalidateTag } from "next/cache";
import { requireOrigin } from "@/lib/csrf";

export async function PUT(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { configId, order } = body;

    if (!configId || !Array.isArray(order)) {
      return NextResponse.json({ error: "Missing configId or order array" }, { status: 400 });
    }

    await saveSectionOrder(configId, order, admin.name);

  revalidateTag("landing");

  return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save order" }, { status: 500 });
  }
}
