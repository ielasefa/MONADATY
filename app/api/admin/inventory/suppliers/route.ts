import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { authGuard, errorResponse, successResponse } from "@/lib/inventory-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const active = searchParams.get("active");

    const where: Prisma.SupplierWhereInput = {};
    if (active === "true") where.active = true;
    if (active === "false") where.active = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return successResponse({ suppliers });
  } catch (err) {
    logError(err, "Failed to fetch suppliers:");
    return errorResponse("Failed to fetch suppliers", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const body = await request.json();
    const { name, company, email, phone, address, website, taxNumber, contactPerson, notes, active } = body;

    if (!name) {
      return errorResponse("Supplier name is required");
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        company: company || "",
        email: email || "",
        phone: phone || "",
        address: address || "",
        website: website || "",
        taxNumber: taxNumber || "",
        contactPerson: contactPerson || "",
        notes: notes || "",
        active: active ?? true,
      },
    });

    return successResponse({ success: true, supplier }, 201);
  } catch (err) {
    logError(err, "Failed to create supplier:");
    return errorResponse("Failed to create supplier", 500);
  }
}
