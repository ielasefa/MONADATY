import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";
import { validateEnv } from "./env-validator";
import {
  MUST_CHANGE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE,
  signSessionToken,
  verifySessionToken,
} from "./session-token";

validateEnv();

export {
  MUST_CHANGE_COOKIE,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE,
};

export async function validateCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSessionDB(admin: { id: string; mustChangePassword: boolean }): Promise<string> {
  const sessionId = crypto.randomUUID();
  const hashedToken = hashToken(sessionId);
  const signed = await signSessionToken(sessionId);

  await prisma.admin.update({
    where: { id: admin.id },
    data: { sessionToken: hashedToken, lastLoginAt: new Date() },
  });

  return signed;
}

export async function clearSessionDB(signed: string): Promise<void> {
  const token = await verifySessionToken(signed);
  if (!token) return;

  const hashedToken = hashToken(token.sessionId);
  await prisma.$transaction([
    prisma.admin.updateMany({
      where: { sessionToken: hashedToken },
      data: { sessionToken: null },
    }),
    prisma.deviceSession.deleteMany({ where: { token: hashedToken } }),
  ]);
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
  const token = await verifySessionToken(signed);
  if (!token) return false;
  const hashedToken = hashToken(token.sessionId);
  const admin = await prisma.admin.findFirst({
    where: { sessionToken: hashedToken },
    select: { id: true, mustChangePassword: true, lastLoginAt: true, role: true },
  });
  if (!admin) return false;
  return { id: admin.id, mustChangePassword: admin.mustChangePassword, lastLoginAt: admin.lastLoginAt, role: admin.role as "SUPER_ADMIN" | "ADMIN" };
}

export async function getAuthenticatedAdmin(): Promise<AuthenticatedAdmin | null> {
  try {
    const cookieStore = await cookies();
    const signed = cookieStore.get(SESSION_COOKIE)?.value;
    if (!signed) return null;
    const token = await verifySessionToken(signed);
    if (!token) return null;
    const hashedToken = hashToken(token.sessionId);
    const admin = await prisma.admin.findFirst({
      where: { sessionToken: hashedToken },
      select: { id: true, email: true, name: true, mustChangePassword: true, lastLoginAt: true, role: true },
    });
    if (!admin) return null;
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      mustChangePassword: admin.mustChangePassword,
      lastLoginAt: admin.lastLoginAt,
      role: admin.role as "SUPER_ADMIN" | "ADMIN",
    };
  } catch {
    return null;
  }
}
