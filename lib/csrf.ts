import { NextResponse } from "next/server";

function parseOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS || "";
  const list = raw
    .split(",")
    .map(normalizeConfiguredOrigin)
    .filter(Boolean);

  if (process.env.APP_URL) {
    const appUrl = normalizeConfiguredOrigin(process.env.APP_URL);
    if (appUrl && !list.includes(appUrl)) {
      list.push(appUrl);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return list;
}

function getAllowedOrigins(): string[] {
  return [...new Set(parseOrigins())];
}

function normalizeConfiguredOrigin(value: string): string {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

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

  const rawSource = origin ?? extractOrigin(referer ?? "");
  if (!rawSource) return false;

  try {
    const parsed = new URL(rawSource);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const normalizedOrigin = parsed.origin;

    const allowedOrigins = getAllowedOrigins();
    for (const allowed of allowedOrigins) {
      if (normalizedOrigin === allowed) return true;
    }
  } catch {
    // fall through to raw comparison
  }

  return false;
}

export function requireOrigin(request: Request): NextResponse | null {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
