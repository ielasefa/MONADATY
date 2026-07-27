import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const collections = await prisma.collection.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ collections });
  } catch (err) {
    logError(err, "Failed to fetch collections:");
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
