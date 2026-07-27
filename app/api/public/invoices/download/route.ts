import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";
import { verifySignedToken, recordInvoiceEvent } from "@/lib/invoice";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const invoiceNumber = verifySignedToken(token);
  if (!invoiceNumber) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: { order: { select: { orderNumber: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status !== "Issued") {
    return NextResponse.json({ error: "Invoice is not available" }, { status: 400 });
  }

  if (!invoice.pdfPath) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), "public", invoice.pdfPath);
  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: "PDF file not found on disk" }, { status: 404 });
  }

  await recordInvoiceEvent(invoice.id, "downloaded", `Signed public download`);

  const fileBuffer = fs.readFileSync(absolutePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Content-Length": String(fileBuffer.length),
    },
  });
}
