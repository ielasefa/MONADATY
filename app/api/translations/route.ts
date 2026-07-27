import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const namespace = searchParams.get("namespace") ?? "common";

  try {
    const rows = await prisma.translation.findMany({
      where: { namespace },
      select: { key: true, fr: true, en: true, ar: true },
    });

    const translations: Record<string, Record<string, string>> = {};
    for (const row of rows) {
      translations[row.key] = { fr: row.fr, en: row.en, ar: row.ar };
    }

    return NextResponse.json({ translations, namespace });
  } catch {
    return NextResponse.json({ translations: {}, namespace });
  }
}
