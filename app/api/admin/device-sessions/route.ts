import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getDeviceSessions, terminateSession, terminateOtherSessions } from "@/lib/device-sessions";
import { SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await getDeviceSessions(admin.id);
    return NextResponse.json({ sessions });
  } catch (err) {
    logError(err, "Failed to handle device sessions:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("id");
    const allExceptCurrent = searchParams.get("allExceptCurrent") === "true";
    const action = searchParams.get("action");

    if (allExceptCurrent) {
      const cookieStore = await import("next/headers").then(m => m.cookies());
      const signed = cookieStore.get(SESSION_COOKIE)?.value ?? "";
      await terminateOtherSessions(admin.id, signed);
      return NextResponse.json({ success: true, message: "Other sessions terminated" });
    }

    if (action === "terminate-all") {
      const cookieStore = await import("next/headers").then(m => m.cookies());
      const signed = cookieStore.get(SESSION_COOKIE)?.value ?? "";
      await terminateOtherSessions(admin.id, signed);
      return NextResponse.json({ success: true, message: "Other sessions terminated" });
    }

    if (sessionId) {
      await terminateSession(sessionId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  } catch (err) {
    logError(err, "Failed to handle device sessions:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
