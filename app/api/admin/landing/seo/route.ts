import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSeo } from "@/lib/landing-cms";
import { requireOrigin } from "@/lib/csrf";
import { revalidatePath } from "next/cache";
import { logError } from "@/lib/logger";

const SEO_FIELDS = [
  "title",
  "metaDescription",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "canonicalUrl",
] as const;

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get("configId");
    if (!configId) {
      return NextResponse.json({ error: "Missing configId" }, { status: 400 });
    }

    const config = await prisma.landingConfig.findUnique({
      where: { id: configId },
      include: { seo: true },
    });
    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    return NextResponse.json({ data: config.seo });
  } catch (error) {
    logError(error, "GET /api/admin/landing/seo");
    return NextResponse.json({ error: "Failed to fetch SEO" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const originError = requireOrigin(request);
  if (originError) return originError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    if (!isStringRecord(body)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { configId, ...seoData } = body;
    if (!configId || typeof configId !== "string") {
      return NextResponse.json({ error: "Missing configId" }, { status: 400 });
    }

    const config = await prisma.landingConfig.findUnique({ where: { id: configId } });
    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    const sanitized: Record<string, string> = {};
    for (const field of SEO_FIELDS) {
      const value = seoData[field];
      if (value !== undefined && value !== null) {
        if (typeof value !== "string") {
          return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
        }
        sanitized[field] = value;
      } else {
        sanitized[field] = "";
      }
    }

    if (sanitized.canonicalUrl) {
      try {
        new URL(sanitized.canonicalUrl);
      } catch {
        return NextResponse.json({ error: "Invalid canonicalUrl" }, { status: 400 });
      }
    }
    if (sanitized.ogImage) {
      try {
        new URL(sanitized.ogImage);
      } catch {
        return NextResponse.json({ error: "Invalid ogImage" }, { status: 400 });
      }
    }

    await saveSeo(configId, sanitized, admin.name);

    revalidatePath("/");
    revalidatePath("/admin/landing");

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, "PUT /api/admin/landing/seo");
    return NextResponse.json({ error: "Failed to save SEO" }, { status: 500 });
  }
}
