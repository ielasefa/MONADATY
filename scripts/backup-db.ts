#!/usr/bin/env -S tsx

import "dotenv/config";
import { spawn } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { createGzip } from "zlib";
import { pipeline } from "stream/promises";
import path from "path";
import { postgresCliConfig } from "./postgres-cli-config";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const DB_URL = process.env.DATABASE_URL;

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

async function backup() {
  if (!DB_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required");
    process.exit(1);
  }

  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const db = postgresCliConfig(DB_URL);
  const timestamp = getTimestamp();
  const filename = `monadaty-backup-${timestamp}.sql.gz`;
  const filepath = path.join(BACKUP_DIR, filename);

  console.log(`Backing up database "${db.database}" on ${db.host}:${db.port}...`);

  try {
    const dump = spawn(
      "pg_dump",
      [
        `--host=${db.host}`,
        `--port=${db.port}`,
        `--username=${db.user}`,
        "--format=custom",
        "--no-owner",
        "--no-acl",
        db.database,
      ],
      { env: db.env, stdio: ["ignore", "pipe", "pipe"] },
    );
    let stderr = "";
    dump.stderr.setEncoding("utf8");
    dump.stderr.on("data", (chunk: string) => {
      if (stderr.length < 16_384) stderr += chunk;
    });

    const gzip = createGzip({ level: 9 });
    const output = createWriteStream(filepath);
    const exit = new Promise<void>((resolve, reject) => {
      dump.once("error", reject);
      dump.once("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`pg_dump exited with code ${code}: ${stderr.trim()}`));
      });
    });
    await Promise.all([pipeline(dump.stdout, gzip, output), exit]);

    const stats = statSync(filepath);
    const sizeMb = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`Backup saved: ${filepath} (${sizeMb} MB)`);

    // Keep only last 12 backups
    const files = readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("monadaty-backup-") && f.endsWith(".sql.gz"))
      .sort()
      .reverse();

    while (files.length > 12) {
      const old = files.pop();
      if (old) {
        unlinkSync(path.join(BACKUP_DIR, old));
        console.log(`Removed old backup: ${old}`);
      }
    }

    console.log("Backup completed successfully.");
    return filepath;
  } catch (err: unknown) {
    try {
      if (existsSync(filepath)) unlinkSync(filepath);
    } catch {
      // Best-effort cleanup of an incomplete backup.
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("Backup failed:", message);
    process.exitCode = 1;
  } finally {
    db.cleanup();
  }
}

void backup();
