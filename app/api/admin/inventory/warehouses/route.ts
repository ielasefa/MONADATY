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
    const active = searchParams.get("active");

    const where: Prisma.WarehouseWhereInput = {};
    if (active === "true") where.isActive = true;
    if (active === "false") where.isActive = false;

    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return successResponse({ warehouses });
  } catch (err) {
    logError(err, "Failed to fetch warehouses:");
    return errorResponse("Failed to fetch warehouses", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await authGuard(request);
    if (guard instanceof NextResponse) return guard;

    const body = await request.json();
    const { name, code, address, city, country, manager, phone, email, isDefault, isActive } = body;

    if (!name || !code) {
      return errorResponse("Name and code are required");
    }

    const existing = await prisma.warehouse.findUnique({ where: { code } });
    if (existing) {
      return errorResponse("Warehouse code already exists");
    }

    if (isDefault) {
      await prisma.warehouse.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        address: address || "",
        city: city || "",
        country: country || "Morocco",
        manager: manager || "",
        phone: phone || "",
        email: email || "",
        isDefault: isDefault || false,
        isActive: isActive ?? true,
      },
    });

    return successResponse({ success: true, warehouse }, 201);
  } catch (err) {
    logError(err, "Failed to create warehouse:");
    return errorResponse("Failed to create warehouse", 500);
  }
}
