import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSection, saveSectionOrder } from "@/lib/landing-cms";
import { revalidatePath } from "next/cache";
import { requireOrigin } from "@/lib/csrf";

export async function PUT(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { configId, sectionType, data, order } = body;

    if (!configId || !sectionType) {
      return NextResponse.json({ error: "Missing configId or sectionType" }, { status: 400 });
    }

    await saveSection(configId, sectionType, data, admin.name);

    if (order) {
      await saveSectionOrder(configId, order, admin.name);
    }

    revalidatePath("/");
    revalidatePath("/admin/landing");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { configId, sectionType } = body;

    if (!configId || !sectionType) {
      return NextResponse.json({ error: "Missing configId or sectionType" }, { status: 400 });
    }

    const config = await prisma.landingConfig.findUnique({
      where: { id: configId },
      include: { [sectionType as keyof typeof prisma.landingConfig]: true } as any,
    });

    const section = (config as any)?.[sectionType];
    return NextResponse.json({ data: section || null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch" }, { status: 500 });
  }
}
