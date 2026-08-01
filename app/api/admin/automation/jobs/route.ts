import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { getJobs, updateJob, runJob, initializeDefaultJobs } from "@/lib/automation";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const jobs = await getJobs();
    return NextResponse.json({ jobs });
  } catch (err) {
    logError(err, "Failed to handle automation jobs:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = requireOrigin(request);
    if (csrfError) return csrfError;

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    if (body.action === "initialize") {
      await initializeDefaultJobs();
      return NextResponse.json({ success: true });
    }

    if (body.action === "run") {
      const result = await runJob(body.jobId, "manual");
      return NextResponse.json(result);
    }

    if (body.action === "update") {
      await updateJob(body.jobId, body.data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    logError(err, "Failed to handle automation jobs:");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
