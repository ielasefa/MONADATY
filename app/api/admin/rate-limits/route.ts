import { logError } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    const dayAgo = new Date(now.getTime() - 86400000);

    const [totalRequests, blockedCount, slowCount, recentLogs, topIps] = await Promise.all([
      prisma.rateLimitLog.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.rateLimitLog.count({ where: { blocked: true, createdAt: { gte: dayAgo } } }),
      prisma.rateLimitLog.count({ where: { duration: { gt: 1000 }, createdAt: { gte: hourAgo } } }),
      prisma.rateLimitLog.findMany({
        where: { createdAt: { gte: hourAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.rateLimitLog.groupBy({
        by: ["ip"],
        where: { createdAt: { gte: dayAgo }, blocked: true },
        _count: true,
        orderBy: { _count: { ip: "desc" } },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      totalRequests,
      blockedCount,
      slowCount,
      recentLogs,
      topAttackers: topIps.map(i => ({ ip: i.ip, count: i._count })),
    });
  } catch (err) {
    logError(err, "Failed to fetch rate limits:");
    return NextResponse.json({ error: "Failed to fetch rate limits" }, { status: 500 });
  }
}
