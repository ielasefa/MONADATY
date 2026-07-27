import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ categories });
  } catch (err) {
    logError(err, "Failed to fetch categories:");
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
