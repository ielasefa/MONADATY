#!/usr/bin/env -S tsx

import "dotenv/config";
import { createReadStream, existsSync, readdirSync, statSync, openAsBlob } from "fs";
import { createHash } from "crypto";
import path from "path";
import { OAuth2Client } from "google-auth-library";

const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required setting: ${name}`);
  return value;
}

async function upload() {
  // Authorize as the Drive owner; refresh tokens keep monthly jobs unattended.
  const auth = new OAuth2Client(required("GOOGLE_DRIVE_CLIENT_ID"), required("GOOGLE_DRIVE_CLIENT_SECRET"));
  auth.setCredentials({ refresh_token: required("GOOGLE_DRIVE_REFRESH_TOKEN") });
  const folderId = required("GOOGLE_DRIVE_ID");
  const argument = process.argv[2];
  const latest = !argument && existsSync(backupDir)
    ? readdirSync(backupDir).filter(f => /^monadaty-backup-.*\.sql\.gz$/.test(f)).sort().at(-1)
    : undefined;
  const filename = argument || latest;
  if (!filename) throw new Error("No database backup found. Create a backup before uploading.");
  const filePath = path.resolve(backupDir, filename);
  if (!existsSync(filePath) || !statSync(filePath).isFile() || statSync(filePath).size === 0) {
    throw new Error("Backup file is missing or empty.");
  }
  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("Google authorization did not return an access token.");
  const size = statSync(filePath).size;
  const start = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,size,md5Checksum&supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "application/gzip",
      "X-Upload-Content-Length": String(size),
    },
    body: JSON.stringify({ name: path.basename(filePath), parents: [folderId] }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!start.ok) throw new Error(`Google Drive rejected upload initialization (HTTP ${start.status}).`);
  const uploadUrl = start.headers.get("location");
  if (!uploadUrl || new URL(uploadUrl).protocol !== "https:" || new URL(uploadUrl).hostname !== "www.googleapis.com") {
    throw new Error("Google Drive returned an invalid upload destination.");
  }
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/gzip", "Content-Length": String(size) },
    body: await openAsBlob(filePath, { type: "application/gzip" }),
    signal: AbortSignal.timeout(10 * 60_000),
  });
  if (!response.ok) throw new Error(`Google Drive upload failed (HTTP ${response.status}).`);
  const result = await response.json() as { id?: string; size?: string; md5Checksum?: string };
  const checksum = createHash("md5");
  for await (const chunk of createReadStream(filePath)) checksum.update(chunk);
  if (!result.id || Number(result.size) !== size || result.md5Checksum !== checksum.digest("hex")) {
    throw new Error("Uploaded backup verification failed: size or checksum mismatch.");
  }
  console.log(`Backup uploaded and verified: ${path.basename(filePath)} (${size} bytes).`);
}

upload().catch((error: unknown) => {
  // Avoid printing OAuth request objects, which can contain credentials.
  const message = error instanceof Error ? error.message : "Unknown upload error";
  console.error(`Google Drive backup failed: ${message}`);
  process.exitCode = 1;
});
