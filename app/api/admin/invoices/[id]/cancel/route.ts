import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { recordInvoiceEvent } from "@/lib/invoice";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = requireOrigin(req);
  if (csrfError) return csrfError;

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: { select: { orderNumber: true } } },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "Cancelled") {
      return NextResponse.json({ error: "Invoice is already cancelled" }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: "Cancelled" },
    });

    await recordInvoiceEvent(id, "cancelled", `Invoice ${invoice.invoiceNumber} cancelled for order ${invoice.order?.orderNumber || ""}`);

    return NextResponse.json({ invoice: updated });
  } catch (err) {
    logError(err, "Failed to cancel invoice:");
    return NextResponse.json({ error: "Failed to cancel invoice" }, { status: 500 });
  }
}
