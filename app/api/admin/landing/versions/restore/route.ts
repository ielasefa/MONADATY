import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { restoreVersion } from "@/lib/landing-cms";
import { revalidateTag } from "next/cache";
import { requireOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { configId, versionId } = body;

    if (!configId || !versionId) {
      return NextResponse.json({ error: "Missing configId or versionId" }, { status: 400 });
    }

  await restoreVersion(configId, versionId, admin.name);

  revalidateTag("landing");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to restore" }, { status: 500 });
  }
}
