import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map(s => s.trim().replace(/\/+$/, ""));

function extractOrigin(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^localhost$/, "127.0.0.1");
    return `${parsed.protocol}//${host}`;
  } catch {
    return null;
  }
}

function normalizeHost(host: string): string {
  return host.replace(/^localhost$/, "127.0.0.1");
}

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  const rawSource = origin ?? extractOrigin(referer ?? "");
  if (!rawSource) return false;

  try {
    const parsed = new URL(rawSource);
    const normalizedOrigin = `${parsed.protocol}//${normalizeHost(parsed.host)}`;

    for (const allowed of ALLOWED_ORIGINS) {
      if (normalizedOrigin === allowed) return true;
    }
  } catch {
    // fall through to original comparison below
  }

  for (const allowed of ALLOWED_ORIGINS) {
    if (rawSource === allowed) return true;
  }

  return false;
}

export function requireOrigin(request: Request): NextResponse | null {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
