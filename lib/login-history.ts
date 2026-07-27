import { prisma } from "./prisma";
import { logError } from "./logger";

export async function recordLogin(params: {
  adminId: string;
  ip: string;
  userAgent: string;
  success: boolean;
  failure?: boolean;
}) {
  const ua = parseUserAgent(params.userAgent);
  try {
    await prisma.loginHistory.create({
      data: {
        adminId: params.adminId,
        ip: params.ip,
        browser: ua.browser,
        os: ua.os,
        country: "",
        city: "",
        device: ua.device,
        userAgent: params.userAgent,
        success: params.success,
        failure: params.failure ?? !params.success,
        loginAt: new Date(),
      },
    });
  } catch (e) {
    logError(e, "login history error");
  }
}

export async function recordLogout(adminId: string) {
  try {
    const lastLogin = await prisma.loginHistory.findFirst({
      where: { adminId, success: true, logoutAt: null },
      orderBy: { loginAt: "desc" },
    });
    if (lastLogin) {
      const duration = Math.round((Date.now() - lastLogin.loginAt.getTime()) / 1000);
      await prisma.loginHistory.update({
        where: { id: lastLogin.id },
        data: { logoutAt: new Date(), duration },
      });
    }
  } catch (e) {
    logError(e, "logout history error");
  }
}

export async function getLoginHistory(adminId: string, limit = 50) {
  return prisma.loginHistory.findMany({
    where: { adminId },
    orderBy: { loginAt: "desc" },
    take: limit,
  });
}

export async function getAllLoginHistory(limit = 100, offset = 0) {
  return prisma.loginHistory.findMany({
    orderBy: { loginAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countLoginHistory() {
  return prisma.loginHistory.count();
}

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

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
