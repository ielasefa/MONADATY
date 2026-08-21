import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";

export type HandlerContext = {
  admin: { id: string; name: string; email: string; role: string };
};

export async function authGuard(request: Request): Promise<NextResponse | HandlerContext> {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) {
    const originCheck = requireOrigin(request);
    if (originCheck) return originCheck;
  }

  const authCheck = await requireAdmin();
  if (authCheck) return authCheck;

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { admin };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}
