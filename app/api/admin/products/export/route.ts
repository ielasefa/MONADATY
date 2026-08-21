import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { csvCell } from "@/lib/csv";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const format = request.nextUrl.searchParams.get("format") || "csv";

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        collection: { select: { name: true } },
        _count: { select: { variants: true } },
      },
    });

    const rows = products.map((p) => ({
      "Product": p.name,
      "SKU": p.sku,
      "Category": p.category?.name || "",
      "Collection": p.collection?.name || "",
      "Price": p.price,
      "Sale Price": p.salePrice,
      "Stock": p.stock,
      "Status": p.status,
      "Featured": p.featured ? "Yes" : "No",
      "Best Seller": p.isBestSeller ? "Yes" : "No",
      "Created Date": p.createdAt.toISOString().split("T")[0],
      "Updated Date": p.updatedAt.toISOString().split("T")[0],
      "Variants Count": p._count.variants,
    }));

    if (format === "csv") {
      const headers = Object.keys(rows[0] || {});
      const csvLines = [
        headers.map(csvCell).join(","),
        ...rows.map((row) =>
          headers.map((h) => {
            const val = (row as Record<string, string | number>)[h] ?? "";
            return csvCell(val);
          }).join(",")
        ),
      ];
      const csv = csvLines.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="products-export-${Date.now()}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      // Simple XML-based XLSX generation
      const xml = generateSimpleXlsx(rows);
      return new NextResponse(xml, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="products-export-${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (err) {
    logError(err, "Failed to export products:");
    return NextResponse.json({ error: "Failed to export products" }, { status: 500 });
  }
}

function generateSimpleXlsx(rows: Record<string, string | number>[]): string {
  const headers = Object.keys(rows[0] || {});

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<?mso-application progid="Excel.Sheet"?>';
  xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`;

  xml += "<Worksheet ss:Name='Products'>";
  xml += "<Table>";

  // Header row
  xml += "<Row>";
  for (const h of headers) {
    xml += `<Cell><Data ss:Type='String'>${escapeXml(h)}</Data></Cell>`;
  }
  xml += "</Row>";

  // Data rows
  for (const row of rows) {
    xml += "<Row>";
    for (const h of headers) {
      const val = row[h];
      const isNum = typeof val === "number" || (!isNaN(Number(val)) && val !== "");
      xml += `<Cell><Data ss:Type='${isNum ? "Number" : "String"}'>${escapeXml(String(val))}</Data></Cell>`;
    }
    xml += "</Row>";
  }

  xml += "</Table>";
  xml += "</Worksheet>";
  xml += "</Workbook>";

  return xml;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
