#!/usr/bin/env npx tsx

import "dotenv/config";
import { createReadStream, existsSync, statSync } from "fs";
import path from "path";

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_ID;
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");

type DriveFile = {
  id: string;
  name: string;
};

type DriveError = {
  error?: { message?: string };
};

async function uploadToDrive(filePath: string) {
  if (!DRIVE_FOLDER_ID) {
    console.error("ERROR: GOOGLE_DRIVE_ID environment variable is required");
    process.exit(1);
  }

  if (!existsSync(filePath)) {
    console.error(`ERROR: File not found: ${filePath}`);
    process.exit(1);
  }

  // @ts-expect-error - optional dependency
  const { google } = await import("googleapis");
  // @ts-expect-error - optional dependency
  const { GoogleAuth } = await import("google-auth-library");

  const stats = statSync(filePath);
  const fileName = path.basename(filePath);

  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
    parents: [DRIVE_FOLDER_ID],
  };

  const media = {
    mimeType: "application/gzip",
    body: createReadStream(filePath),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id,name",
    });

    const file = response.data as DriveFile;
    console.log(`Uploaded to Google Drive: ${file.name} (ID: ${file.id})`);
    return file;
  } catch (err: unknown) {
    const driveErr = err as DriveError;
    const message = driveErr?.error?.message || (err instanceof Error ? err.message : String(err));
    console.error("Google Drive upload failed:", message);
    process.exit(1);
  }
}

const latestBackup = process.argv[2];

if (latestBackup) {
  const filePath = path.isAbsolute(latestBackup) ? latestBackup : path.join(BACKUP_DIR, latestBackup);
  uploadToDrive(filePath);
} else {
  const { readdirSync } = await import("fs");
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("monadaty-backup-") && f.endsWith(".sql.gz"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("ERROR: No backup files found in", BACKUP_DIR);
    process.exit(1);
  }

  const latest = path.join(BACKUP_DIR, files[0]);
  console.log(`Uploading latest backup: ${latest}`);
  uploadToDrive(latest);
}
