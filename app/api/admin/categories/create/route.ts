import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { name, slug } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }
    const category = await prisma.category.create({
      data: { name: name.trim(), slug: slug.trim() },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    logError(err, "Failed to create category:");
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
