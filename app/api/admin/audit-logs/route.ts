import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getAuditLogs, countAuditLogs } from "@/lib/audit";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const action = searchParams.get("action") ?? undefined;
    const entity = searchParams.get("entity") ?? undefined;
    const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
    const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

    const [logs, total] = await Promise.all([
      getAuditLogs(limit, offset, { action, entity, from, to }),
      countAuditLogs({ action, entity, from, to }),
    ]);

    return NextResponse.json({ logs, total });
  } catch (err) {
    logError(err, "AUDIT_LOGS");
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
