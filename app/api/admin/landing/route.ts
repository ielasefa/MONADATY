import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getAdminLanding } from "@/lib/landing-cms";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getAdminLanding();
  return NextResponse.json({ data });
}
