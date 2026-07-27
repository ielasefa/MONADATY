import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getInvoicesList } from "@/lib/invoice";
import { isAuthenticated } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const sortField = searchParams.get("sortField") || "createdAt";
  const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";

  try {
    const result = await getInvoicesList({ search, status, page, pageSize, sortField, sortDir });
    return NextResponse.json(result);
  } catch (err) {
    logError(err, "Failed to fetch invoices:");
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
