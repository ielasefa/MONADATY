import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type StoredFile = {
  url: string;
  filename: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
};

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const ALLOWED_MIME_PREFIXES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const SUBDIRECTORIES = ["products", "categories", "collections", "banners", "blog", "settings"];

export function getUploadDir(subfolder: string): string {
  const safe = subfolder.replace(/\.\./g, "").replace(/[^a-zA-Z0-9_/-]/g, "").replace(/^\/+|\/+$/g, "");
  return path.join(UPLOAD_ROOT, safe);
}

export function getPublicUrl(subfolder: string, filename: string): string {
  return `/uploads/${subfolder.replace(/\.\./g, "").replace(/^\/+|\/+$/g, "")}/${filename}`;
}

export async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function ensureAllDirs(): Promise<void> {
  for (const sub of SUBDIRECTORIES) {
    await ensureDir(getUploadDir(sub));
  }
}

function generateFilename(ext: string): string {
  return `${randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
}

function getExtension(mimeType: string, filename?: string): string {
  const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  if (extMap[mimeType]) return extMap[mimeType];
  if (filename) {
    const ext = path.extname(filename).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) return ext;
  }
  return ".jpg";
}

function parseDataUri(uri: string): { buffer: Buffer; mimeType: string } | null {
  const match = uri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  const mimeType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  return { buffer, mimeType };
}

function getImageDimensions(buffer: Buffer): { width: number; height: number } {
  const magic = buffer.subarray(0, 8).toString("hex");

  if (magic.startsWith("89504e47")) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (magic.startsWith("ffd8")) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += length + 2;
    }
  }

  if (magic.startsWith("474946")) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  if (magic.startsWith("52494646") && buffer.subarray(8, 12).toString() === "WEBP") {
    const chunkType = buffer.subarray(12, 16).toString();
    if (chunkType === "VP8 " && buffer.length >= 30) {
      return {
        width: ((buffer[27] & 0x3f) << 8) | buffer[26],
        height: ((buffer[29] & 0x3f) << 8) | buffer[28],
      };
    }
    if (chunkType === "VP8X" && buffer.length >= 30) {
      return {
        width: buffer.readUIntLE(24, 3) + 1,
        height: buffer.readUIntLE(27, 3) + 1,
      };
    }
    if (chunkType === "VP8L" && buffer.length >= 25) {
      const bits = buffer.readUInt16LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) | ((buffer[23] & 0x0f) << 2)) + 1,
      };
    }
  }

  return { width: 0, height: 0 };
}

export function validateFile(
  file: File,
): { valid: true } | { valid: false; error: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum ${MAX_FILE_SIZE / 1024 / 1024} MB.` };
  }

  if (!ALLOWED_MIME_PREFIXES.includes(file.type)) {
    return { valid: false, error: `Invalid file type: ${file.type}` };
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Invalid file extension: ${ext}` };
  }

  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return { valid: false, error: "Invalid filename" };
  }

  return { valid: true };
}

export async function saveBuffer(
  buffer: Buffer,
  subfolder: string,
  mimeType: string,
  customFilename?: string,
): Promise<StoredFile> {
  await ensureAllDirs();

  const ext = getExtension(mimeType, customFilename);
  const filename = customFilename && !customFilename.includes(".")
    ? `${customFilename}${ext}`
    : customFilename || generateFilename(ext);

  const dir = getUploadDir(subfolder);
  await ensureDir(dir);

  const filepath = path.join(dir, filename);
  await writeFile(filepath, buffer);

  const dims = getImageDimensions(buffer);
  const format = mimeType.replace("image/", "");

  return {
    url: getPublicUrl(subfolder, filename),
    filename,
    bytes: buffer.length,
    width: dims.width,
    height: dims.height,
    format,
  };
}

export async function saveFileFromDataUri(
  dataUri: string,
  subfolder: string,
  customFilename?: string,
): Promise<StoredFile> {
  const parsed = parseDataUri(dataUri);
  if (!parsed) {
    throw new Error("Invalid data URI");
  }

  const { buffer, mimeType } = parsed;
  if (!ALLOWED_MIME_PREFIXES.includes(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}`);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(buffer.length / 1024 / 1024).toFixed(1)} MB`);
  }

  return saveBuffer(buffer, subfolder, mimeType, customFilename);
}

export function urlToFilepath(url: string): string | null {
  const match = url.match(/^\/uploads\/(.+)$/);
  if (!match) return null;
  const relativePath = match[1];
  if (relativePath.includes("..")) return null;
  return path.join(UPLOAD_ROOT, relativePath);
}

export async function deleteFileByUrl(url: string): Promise<boolean> {
  const filepath = urlToFilepath(url);
  if (!filepath) return false;
  try {
    await unlink(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function deleteFile(filename: string, subfolder: string): Promise<boolean> {
  const dir = getUploadDir(subfolder);
  const filepath = path.join(dir, filename.replace(/\.\./g, ""));
  try {
    await unlink(filepath);
    return true;
  } catch {
    return false;
  }
}

export async function replaceFile(
  buffer: Buffer,
  subfolder: string,
  mimeType: string,
  oldUrl?: string,
): Promise<StoredFile> {
  if (oldUrl) {
    await deleteFileByUrl(oldUrl);
  }
  return saveBuffer(buffer, subfolder, mimeType);
}

export { UPLOAD_ROOT, SUBDIRECTORIES };
