import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { logError, logInfo, logWarning } from "./logger";
import { buildPoolConfig } from "./database-config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

const pool =
  globalForPrisma.pool ??
  new Pool(buildPoolConfig());

if (!globalForPrisma.pool) {
  globalForPrisma.pool = pool;
  pool.on("error", (err) => {
    if (err.message?.includes("Connection terminated unexpectedly")) {
      logWarning("Idle pg pool client disconnected — the pool will create a fresh connection on next use.");
    } else {
      logError(err, "Unrecoverable pg pool error");
    }
  });
}

const adapter =
  globalForPrisma.adapter ?? new PrismaPg(pool);
if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = adapter;
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (typeof process !== "undefined" && !globalThis.__prismaSigtermRegistered) {
  globalThis.__prismaSigtermRegistered = true;
  process.once("SIGTERM", async () => {
    logInfo("SIGTERM signal received: closing HTTP connection");
    await pool.end();
  });
}

globalForPrisma.prisma = prisma;
