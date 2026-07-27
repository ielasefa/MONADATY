import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { orderId },
    });

    return NextResponse.json({ invoice: invoice ? {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      orderId: invoice.orderId,
      status: invoice.status,
      pdfPath: invoice.pdfPath,
      createdAt: invoice.createdAt.toISOString(),
    } : null });
  } catch (err) {
    logError(err, "Failed to fetch invoice by order:");
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}
