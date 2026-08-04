import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveSection, saveSectionOrder } from "@/lib/landing-cms";
import { revalidateTag, revalidatePath } from "next/cache";
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

    if (sectionType === "featured" && data.productIds !== undefined) {
      const ids = typeof data.productIds === "string" ? data.productIds.split(",").filter(Boolean) : [];
      if (ids.length > 4) {
        return NextResponse.json({ error: "Maximum 4 products allowed" }, { status: 400 });
      }
      if (ids.length > 0) {
        const count = await prisma.product.count({ where: { id: { in: ids } } });
        if (count !== ids.length) {
          return NextResponse.json({ error: "One or more selected products do not exist" }, { status: 400 });
        }
      }
    }

    if (sectionType === "collections" && data.selectedCollectionIds !== undefined) {
      const ids = typeof data.selectedCollectionIds === "string" ? data.selectedCollectionIds.split(",").filter(Boolean) : [];
      if (ids.length > 4) {
        return NextResponse.json({ error: "Maximum 4 collections allowed" }, { status: 400 });
      }
      if (ids.length > 0) {
        const count = await prisma.collection.count({ where: { id: { in: ids } } });
        if (count !== ids.length) {
          return NextResponse.json({ error: "One or more selected collections do not exist" }, { status: 400 });
        }
      }
    }

    await saveSection(configId, sectionType, data, admin.name);

  if (order) {
    await saveSectionOrder(configId, order, admin.name);
  }

  revalidateTag("landing");
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
