#!/usr/bin/env -S tsx

import "dotenv/config";
import { execFileSync } from "child_process";
import { createReadStream, createWriteStream, existsSync, realpathSync, statSync, unlinkSync } from "fs";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import path from "path";
import os from "os";
import { postgresCliConfig } from "./postgres-cli-config";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const DB_URL = process.env.DATABASE_URL;

async function restore() {
  if (!DB_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const backupFile = process.argv[2];

  if (!backupFile) {
    console.error("Usage: npm exec -- tsx scripts/restore-db.ts <backup-file>");
    console.error("       npm exec -- tsx scripts/restore-db.ts latest");
    process.exit(1);
  }

  const backupRoot = realpathSync(BACKUP_DIR);
  let candidate: string;
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
    candidate = path.join(backupRoot, files[0]);
    console.log(`Using latest backup: ${files[0]}`);
  } else {
    candidate = path.resolve(backupRoot, backupFile);
    if (!candidate.startsWith(`${backupRoot}${path.sep}`) || !existsSync(candidate)) {
      console.error("ERROR: Backup file must be located inside BACKUP_DIR");
      process.exit(1);
    }
  }

  if (!existsSync(candidate)) {
    console.error(`ERROR: Backup file not found: ${candidate}`);
    process.exit(1);
  }
  const filePath = realpathSync(candidate);
  if (!filePath.startsWith(`${backupRoot}${path.sep}`) || !statSync(filePath).isFile()) {
    console.error("ERROR: Backup must resolve to a regular file inside BACKUP_DIR");
    process.exit(1);
  }

  const db = postgresCliConfig(DB_URL);
  if (!db.local) {
    db.cleanup();
    console.error("ERROR: This restore script is restricted to loopback databases.");
    console.error("Use the approved Supabase recovery procedure for production restores.");
    process.exit(1);
  }
  const tmpFile = path.join(os.tmpdir(), `monadaty-restore-${Date.now()}.dump`);

  console.log(`Restoring database "${db.database}" from ${path.basename(filePath)}...`);

  try {
    console.log("  Decompressing backup...");
    const gunzip = createGunzip();
    const input = createReadStream(filePath);
    const output = createWriteStream(tmpFile, { mode: 0o600 });
    await pipeline(input, gunzip, output);
    console.log(`  Decompressed to ${tmpFile}`);

    console.log("  Dropping and recreating database...");
    execFileSync(
      "dropdb",
      [`--host=${db.host}`, `--port=${db.port}`, `--username=${db.user}`, "--if-exists", db.database],
      { env: db.env, stdio: "pipe" },
    );
    execFileSync(
      "createdb",
      [`--host=${db.host}`, `--port=${db.port}`, `--username=${db.user}`, db.database],
      { env: db.env, stdio: "pipe" },
    );

    console.log("  Restoring from dump...");
    execFileSync(
      "pg_restore",
      [
        `--host=${db.host}`,
        `--port=${db.port}`,
        `--username=${db.user}`,
        `--dbname=${db.database}`,
        "--no-owner",
        "--no-acl",
        tmpFile,
      ],
      { env: db.env, stdio: "pipe", maxBuffer: 500 * 1024 * 1024 },
    );

    console.log("✅ Database restored successfully!");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Restore failed:", message);
    process.exitCode = 1;
  } finally {
    db.cleanup();
    try {
      unlinkSync(tmpFile);
    } catch {
      // ignore cleanup errors
    }
  }
}

void restore();
