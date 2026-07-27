import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map(s => s.trim().replace(/\/+$/, ""));

function extractOrigin(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  const sourceOrigin = origin ?? extractOrigin(referer ?? "");

  if (!sourceOrigin) return false;

  for (const allowed of ALLOWED_ORIGINS) {
    if (sourceOrigin === allowed) return true;
  }

  return false;
}

export function requireOrigin(request: Request): NextResponse | null {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
