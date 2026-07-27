import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const excludeId = req.nextUrl.searchParams.get("excludeId");

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: excludeId ? { slug, id: { not: excludeId } } : { slug },
    });
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ error: "Failed to check slug" }, { status: 500 });
  }
}
