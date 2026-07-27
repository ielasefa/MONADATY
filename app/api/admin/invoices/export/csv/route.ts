import { logError } from "@/lib/logger";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            total: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = "Invoice Number,Status,Customer Name,Customer Email,Order Number,Total,Currency,Issue Date,PDF Path\n";
    const rows = invoices
      .map((inv) =>
        [
          inv.invoiceNumber,
          inv.status,
          inv.order?.customerName || "",
          inv.order?.customerEmail || "",
          inv.order?.orderNumber || "",
          inv.order?.total || "",
          inv.order?.currency || "",
          inv.createdAt.toISOString(),
          inv.pdfPath || "",
        ]
          .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    logError(err, "Failed to export invoices CSV:");
    return NextResponse.json({ error: "Failed to export invoices" }, { status: 500 });
  }
}
