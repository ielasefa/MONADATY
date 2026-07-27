import { prisma } from "./prisma";
import crypto from "crypto";

export async function createDeviceSession(params: {
  adminId: string;
  token: string;
  ip: string;
  userAgent: string;
}) {
  const ua = parseUA(params.userAgent);
  await prisma.deviceSession.create({
    data: {
      adminId: params.adminId,
      token: hashToken(params.token),
      browser: ua.browser,
      os: ua.os,
      ip: params.ip,
      device: ua.device,
      userAgent: params.userAgent,
      isCurrent: true,
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function getDeviceSessions(adminId: string) {
  return prisma.deviceSession.findMany({
    where: { adminId, expiresAt: { gt: new Date() } },
    orderBy: { lastActiveAt: "desc" },
  });
}

export async function terminateSession(sessionId: string) {
  await prisma.deviceSession.delete({ where: { id: sessionId } });
}

export async function terminateOtherSessions(adminId: string, currentToken: string) {
  const hashed = hashToken(currentToken);
  await prisma.deviceSession.deleteMany({
    where: { adminId, token: { not: hashed } },
  });
}

export async function updateSessionActivity(token: string) {
  const hashed = hashToken(token);
  await prisma.deviceSession.updateMany({
    where: { token: hashed },
    data: { lastActiveAt: new Date() },
  });
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseUA(ua: string): { browser: string; os: string; device: string } {
  let browser = "Unknown", os = "Unknown", device = "Desktop";
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) { os = "Android"; device = "Mobile"; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; device = "Mobile"; }
  return { browser, os, device };
}
