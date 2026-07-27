import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { readdirSync, existsSync } from "fs";
import path from "path";
import { getAuthenticatedAdmin } from "@/lib/auth";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const checks: Record<string, string | number | boolean> = {};
  let healthy = true;

  checks.version = "1.0.0";

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch {
    checks.database = "disconnected";
    healthy = false;
  }

  // Check storage
  const { existsSync: fsExists } = await import("fs");
  checks.storage = fsExists(path.join(process.cwd(), "public/uploads")) ? "available" : "missing";

  // Check Resend
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.apiKeys.list();
      checks.email = "connected";
    } else {
      checks.email = "not configured";
    }
  } catch {
    checks.email = "disconnected";
  }

  // Check backup status
  try {
    if (existsSync(BACKUP_DIR)) {
      const backups = readdirSync(BACKUP_DIR)
        .filter((f) => f.startsWith("monadaty-backup-") && f.endsWith(".sql.gz"))
        .sort()
        .reverse();
      checks.backupCount = backups.length;
      checks.latestBackup = backups.length > 0 ? backups[0] : "none";
    } else {
      checks.backupCount = 0;
      checks.latestBackup = "none";
    }
  } catch {
    checks.backupCount = -1;
    checks.latestBackup = "error";
  }

  const statusCode = healthy ? 200 : 503;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      ...checks,
    },
    { status: statusCode },
  );
}
