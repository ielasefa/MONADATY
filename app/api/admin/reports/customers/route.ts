import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getCustomersReport } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  try {
    const report = await getCustomersReport(from, to);
    return NextResponse.json(report);
  } catch (err) {
    logError(err, "Failed to get customers report:");
    return NextResponse.json({ error: "Failed to get customers report" }, { status: 500 });
  }
}
