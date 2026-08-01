import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getVersions, getVersion } from "@/lib/landing-cms";

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const configId = url.searchParams.get("configId");
  const versionId = url.searchParams.get("versionId");

  if (!configId) {
    return NextResponse.json({ error: "Missing configId" }, { status: 400 });
  }

  try {
    if (versionId) {
      const version = await getVersion(configId, versionId);
      if (!version) return NextResponse.json({ error: "Version not found" }, { status: 404 });
      return NextResponse.json({ data: version });
    }

    const versions = await getVersions(configId);
    return NextResponse.json({ data: versions });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch versions" }, { status: 500 });
  }
}
