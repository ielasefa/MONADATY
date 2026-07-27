#!/usr/bin/env npx tsx

import "dotenv/config";
import { execSync } from "child_process";
import { createReadStream, existsSync } from "fs";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import path from "path";
import os from "os";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const DB_URL = process.env.DATABASE_URL;

function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

async function restore() {
  if (!DB_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const backupFile = process.argv[2];

  if (!backupFile) {
    console.error("Usage: npx tsx scripts/restore-db.ts <backup-file>");
    console.error("       npx tsx scripts/restore-db.ts latest   # restore the most recent backup");
    process.exit(1);
  }

  let filePath: string;
  if (backupFile === "latest") {
    const { readdirSync } = await import("fs");
    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("monadaty-backup-") && f.endsWith(".sql.gz"))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error("ERROR: No backup files found in", BACKUP_DIR);
      process.exit(1);
    }
    filePath = path.join(BACKUP_DIR, files[0]);
    console.log(`Using latest backup: ${files[0]}`);
  } else {
    filePath = path.isAbsolute(backupFile) ? backupFile : path.join(BACKUP_DIR, backupFile);
  }

  if (!existsSync(filePath)) {
    console.error(`ERROR: Backup file not found: ${filePath}`);
    process.exit(1);
  }

  const db = parseDbUrl(DB_URL);
  const tmpFile = path.join(os.tmpdir(), `monadaty-restore-${Date.now()}.sql`);

  console.log(`Restoring database "${db.database}" from ${path.basename(filePath)}...`);

  // Decompress
  console.log("  Decompressing backup...");
  const gunzip = createGunzip();
  const input = createReadStream(filePath);
  const output = createWriteStream(tmpFile);
  await pipeline(input, gunzip, output);
  console.log(`  Decompressed to ${tmpFile}`);

  // Restore
  const env = { ...process.env, PGPASSWORD: db.password };
  try {
    console.log("  Dropping and recreating database...");
    execSync(
      `dropdb --host=${db.host} --port=${db.port} --username=${db.user} --if-exists ${db.database}`,
      { env, stdio: "pipe" },
    );
    execSync(
      `createdb --host=${db.host} --port=${db.port} --username=${db.user} ${db.database}`,
      { env, stdio: "pipe" },
    );

    console.log("  Restoring from dump...");
    execSync(
      `psql --host=${db.host} --port=${db.port} --username=${db.user} --dbname=${db.database} < ${tmpFile}`,
      { env, stdio: "pipe", maxBuffer: 500 * 1024 * 1024 },
    );

    console.log("✅ Database restored successfully!");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Restore failed:", message);
    process.exit(1);
  } finally {
    // Clean up temp file
    try {
      const { unlinkSync } = await import("fs");
      unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

restore();
