import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let database: "connected" | "disconnected" = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "disconnected";
  }

  const status = database === "connected" ? "ok" : "error";
  const statusCode = database === "connected" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      database,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode, headers: { "Cache-Control": "no-store" } },
  );
}
