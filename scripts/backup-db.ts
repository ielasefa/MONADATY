#!/usr/bin/env npx tsx

import "dotenv/config";
import { execSync } from "child_process";
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { createGzip } from "zlib";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";

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

  const db = parseDbUrl(DB_URL);
  const timestamp = getTimestamp();
  const filename = `monadaty-backup-${timestamp}.sql.gz`;
  const filepath = path.join(BACKUP_DIR, filename);

  console.log(`Backing up database "${db.database}" on ${db.host}:${db.port}...`);

  const env = { ...process.env, PGPASSWORD: db.password };

  try {
    const dump = execSync(
      `pg_dump --host=${db.host} --port=${db.port} --username=${db.user} --format=custom --no-owner --no-acl ${db.database}`,
      { env, encoding: null, maxBuffer: 500 * 1024 * 1024 },
    );

    const gzip = createGzip({ level: 9 });
    const output = createWriteStream(filepath);

    await pipeline(Readable.from(dump), gzip, output);

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
    const message = err instanceof Error ? err.message : String(err);
    console.error("Backup failed:", message);
    process.exit(1);
  }
}

backup();
