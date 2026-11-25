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

function isLocalDevelopmentHost(hostname: string): boolean {
  if (["localhost", "[::1]", "0.0.0.0"].includes(hostname)) return true;
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || !parts.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return false;
  const [first, second] = parts;
  return first === 127 || first === 10 || (first === 192 && second === 168) || (first === 172 && second >= 16 && second <= 31);
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
    if (process.env.NODE_ENV !== "production" && isLocalDevelopmentHost(parsed.hostname)) {
      const target = new URL(request.url);
      if (normalizedOrigin === target.origin) return true;
      // Next dev can canonicalize a loopback/LAN URL to localhost internally.
      // Only accept the browser's matching local Host on the same server port.
      const host = request.headers.get("host");
      if (host && isLocalDevelopmentHost(target.hostname) && target.port === parsed.port &&
        normalizeConfiguredOrigin(target.protocol + "//" + host) === normalizedOrigin) return true;
    }

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
