import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  return NextResponse.json(
    admin ? { authenticated: true, mustChangePassword: admin.mustChangePassword } : { authenticated: false },
    { status: admin ? 200 : 401, headers: { "Cache-Control": "no-store" } },
  );
}
