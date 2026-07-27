import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { logError, logInfo } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL!, max: 10 });

if (!globalForPrisma.pool) {
  globalForPrisma.pool = pool;
  pool.on("error", (err) => {
    logError(err, "Unexpected error on idle pg client");
  });
}

const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (typeof process !== "undefined" && !globalThis.__prismaSigtermRegistered) {
  globalThis.__prismaSigtermRegistered = true;
  process.once("SIGTERM", async () => {
    logInfo("SIGTERM signal received: closing HTTP connection");
    await pool.end();
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
