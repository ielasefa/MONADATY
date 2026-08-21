import { getSessionSecret } from "./env-validator";

export const SESSION_COOKIE = "admin_session";
export const MUST_CHANGE_COOKIE = "admin_must_change";
export const SESSION_MAX_AGE = 60 * 60 * 24;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

export type VerifiedSessionToken = {
  sessionId: string;
  expiresAt: number;
};

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signatureFor(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToHex(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)));
}

function constantTimeStringEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function signSessionToken(
  sessionId: string,
  expiresAt = Date.now() + SESSION_MAX_AGE * 1000,
): Promise<string> {
  const payload = `${sessionId}:${expiresAt}`;
  return `${payload}.${await signatureFor(payload)}`;
}

export async function verifySessionToken(signed: string): Promise<VerifiedSessionToken | null> {
  if (!signed || signed.length > 512) return null;

  const dot = signed.lastIndexOf(".");
  if (dot <= 0) return null;

  const payload = signed.slice(0, dot);
  const signature = signed.slice(dot + 1);
  if (!/^[a-f0-9]{64}$/.test(signature)) return null;

  const expected = await signatureFor(payload);
  if (!constantTimeStringEqual(signature, expected)) return null;

  const separator = payload.lastIndexOf(":");
  if (separator <= 0) return null;

  const sessionId = payload.slice(0, separator);
  const expiresAt = Number(payload.slice(separator + 1));
  if (!/^[0-9a-f-]{36}$/i.test(sessionId) || !Number.isSafeInteger(expiresAt)) return null;
  if (expiresAt <= Date.now()) return null;

  return { sessionId, expiresAt };
}
