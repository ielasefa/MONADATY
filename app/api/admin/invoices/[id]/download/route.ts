import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";
import { isAuthenticated } from "@/lib/auth";
import { recordInvoiceEvent } from "@/lib/invoice";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    if (invoice.status !== "Issued") {
      return NextResponse.json({ error: "Invoice is not available for download" }, { status: 400 });
    }

    if (!invoice.pdfPath) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const absolutePath = path.join(process.cwd(), "public", invoice.pdfPath);
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: "PDF file not found on disk" }, { status: 404 });
    }

    await recordInvoiceEvent(invoice.id, "downloaded", `Admin download`);

    const fileBuffer = fs.readFileSync(absolutePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err) {
    logError(err, "Failed to download invoice:");
    return NextResponse.json({ error: "Failed to download invoice" }, { status: 500 });
  }
}
