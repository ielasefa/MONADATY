import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getAllJobLogs } from "@/lib/automation";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);

    const logs = await getAllJobLogs(limit);
    return NextResponse.json({ logs });
  } catch (err) {
    logError(err, "Failed to fetch automation logs:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
