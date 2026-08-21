import { existsSync } from "fs";
import { saveFileFromDataUri, deleteFileByUrl, urlToFilepath, UPLOAD_ROOT } from "./storage";
import { logError } from "./logger";

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export async function uploadImage(
  file: string,
  folder = "products",
  publicId?: string,
): Promise<UploadedImage> {
  const stored = await saveFileFromDataUri(file, folder, publicId);

  return {
    url: stored.url,
    publicId: stored.filename,
    width: stored.width,
    height: stored.height,
    format: stored.format,
    bytes: stored.bytes,
  };
}

export async function deleteImage(publicIdOrUrl: string, folder?: string): Promise<void> {
  if (publicIdOrUrl.startsWith("/uploads/")) {
    await deleteFileByUrl(publicIdOrUrl);
    return;
  }

  if (folder) {
    const fpath = urlToFilepath(`/uploads/${folder}/${publicIdOrUrl}`);
    if (fpath && existsSync(fpath)) {
      const { unlink } = await import("fs/promises");
      await unlink(fpath);
    }
    return;
  }

  await deleteFileByUrl(publicIdOrUrl);
}

export async function replaceImage(
  file: string,
  publicId: string,
): Promise<UploadedImage> {
  const folders = ["products", "categories", "collections", "banners", "blog", "settings"];
  for (const dir of folders) {
    const fpath = urlToFilepath(`/uploads/${dir}/${publicId}`);
    if (fpath && existsSync(fpath)) {
      const { unlink } = await import("fs/promises");
      await unlink(fpath).catch(() => {});
      break;
    }
  }

  return uploadImage(file, undefined, publicId);
}

export type CloudinaryStatus =
  | { ok: true }
  | { ok: false; code: "MISSING_CONFIG" | "INVALID_CONFIG" | "UNREACHABLE" | "AUTH_FAILED"; message: string };

export function validateStorageConfig(): CloudinaryStatus {
  return { ok: true };
}

export async function checkStorageConnection(): Promise<CloudinaryStatus> {
  try {
    const { access, mkdir } = await import("fs/promises");
    await mkdir(UPLOAD_ROOT, { recursive: true });
    await access(UPLOAD_ROOT);
    return { ok: true };
  } catch {
    return { ok: false, code: "UNREACHABLE", message: "Upload directory is not accessible." };
  }
}

export function getStorageDiagnostics(): Record<string, string> {
  return {
    upload_root: UPLOAD_ROOT,
    exists: String(existsSync(UPLOAD_ROOT)),
  };
}

export async function safeUploadImage(
  file: string,
  folder = "products",
  publicId?: string,
): Promise<{ data?: UploadedImage; error?: CloudinaryStatus }> {
  try {
    const data = await uploadImage(file, folder, publicId);
    return { data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logError(new Error(msg), "[storage] upload error");
    return { error: { ok: false, code: "UNREACHABLE", message: `Upload failed: ${msg}` } };
  }
}

export function getOptimizedUrl(_publicId: string, _options?: { width?: number; height?: number; quality?: number }): string {
  return "";
}

export function getBlurDataUrl(_publicId: string): string {
  return "";
}

export function getSrcSet(_publicId: string): string {
  return "";
}

export function getSrcSizes(): string {
  return "";
}

export async function generateBlurDataUrl(_publicId: string): Promise<string> {
  return "";
}
