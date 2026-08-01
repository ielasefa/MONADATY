import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";

export async function GET(request: NextRequest) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  return NextResponse.json({ duplicated: true });
}

export async function POST(request: NextRequest) {
  const csrfError = requireOrigin(request);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  return NextResponse.json({ duplicated: true });
}
