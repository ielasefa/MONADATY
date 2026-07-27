import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";
import { validateEnv } from "./env-validator";

validateEnv();

const SESSION_COOKIE = "admin_session";
const MUST_CHANGE_COOKIE = "admin_must_change";
const SESSION_MAX_AGE = 60 * 60 * 24;

export { SESSION_COOKIE, MUST_CHANGE_COOKIE, SESSION_MAX_AGE };

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  throw new Error("SESSION_SECRET environment variable is required");
}

function signToken(token: string): string {
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(token);
  return token + "." + hmac.digest("hex");
}

function unsignToken(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(token);
  const expected = hmac.digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  return token;
}

export async function validateCredentials(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
} as const;

export async function createSessionDB(admin: { id: string; mustChangePassword: boolean }): Promise<string> {
  const token = crypto.randomUUID();
  const hashedToken = hashToken(token);
  const signed = signToken(token);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { sessionToken: hashedToken, lastLoginAt: new Date() },
  });

  return signed;
}

export async function clearSessionDB(signed: string): Promise<void> {
  const token = unsignToken(signed);
  if (token) {
    const hashedToken = hashToken(token);
    await prisma.admin.updateMany({
      where: { sessionToken: hashedToken },
      data: { sessionToken: null },
    });
  }
}

type AuthenticatedAdmin = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
};

type IsAuthenticatedResult = {
  id: string;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  role: "SUPER_ADMIN" | "ADMIN";
};

export async function isAuthenticated(): Promise<IsAuthenticatedResult | false> {
  const cookieStore = await cookies();
  const signed = cookieStore.get(SESSION_COOKIE)?.value;
  if (!signed) return false;
  const token = unsignToken(signed);
  if (!token) return false;
  const hashedToken = hashToken(token);
  const admin = await prisma.admin.findFirst({
    where: { sessionToken: hashedToken },
    select: { id: true, mustChangePassword: true, lastLoginAt: true, role: true },
  });
  if (!admin) return false;
  if (admin.lastLoginAt && Date.now() - admin.lastLoginAt.getTime() > SESSION_MAX_AGE * 1000) {
    return false;
  }
  return { id: admin.id, mustChangePassword: admin.mustChangePassword, lastLoginAt: admin.lastLoginAt, role: admin.role as "SUPER_ADMIN" | "ADMIN" };
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  const cookieStore = await cookies();
  const signed = cookieStore.get(SESSION_COOKIE)?.value;
  if (!signed) return null;
  const token = unsignToken(signed);
  if (!token) return null;
  const hashedToken = hashToken(token);
  const admin = await prisma.admin.findFirst({
    where: { sessionToken: hashedToken },
    select: { id: true, email: true, name: true, mustChangePassword: true, lastLoginAt: true, role: true },
  });
  if (!admin) return null;
  if (admin.lastLoginAt && Date.now() - admin.lastLoginAt.getTime() > SESSION_MAX_AGE * 1000) {
    return null;
  }
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    mustChangePassword: admin.mustChangePassword,
    lastLoginAt: admin.lastLoginAt,
    role: admin.role as "SUPER_ADMIN" | "ADMIN",
  };
}
