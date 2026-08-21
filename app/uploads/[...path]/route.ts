import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { UPLOAD_ROOT } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  const unsafe = segments.some(
    (segment) =>
      !segment ||
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0"),
  );
  if (unsafe) {
    return new NextResponse(null, { status: 404 });
  }

  const checkedInRoot = path.resolve(process.cwd(), "public", "uploads");
  const roots = [...new Set([UPLOAD_ROOT, checkedInRoot])];

  for (const root of roots) {
    const filePath = path.resolve(root, ...segments);
    if (!filePath.startsWith(root + path.sep)) continue;

    try {
      const data = await readFile(filePath);
      const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      return new NextResponse(data, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(data.length),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Try the checked-in asset root after persistent storage.
    }
  }

  return new NextResponse(null, { status: 404 });
}
