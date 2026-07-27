import { NextResponse } from "next/server";
import { safeUploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { requireOrigin } from "@/lib/csrf";
import { logError } from "@/lib/logger";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const MIN_DIMENSION = 100;
const MAX_DIMENSION = 8000;

export async function POST(request: Request) {
  const originCheck = requireOrigin(request);
  if (originCheck) return originCheck;
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = await getAuthenticatedAdmin();

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const hashes = formData.getAll("hashes") as string[];
    const uploadFolder = (formData.get("folder") as string) || "products";

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results: {
      url: string;
      publicId: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
      filename: string;
      imageHash: string;
      blurDataURL: string;
      duplicate: boolean;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const hash = hashes[i] || "";

      const ext = "." + file.name.split(".").pop()?.toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
          { status: 400 },
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name}. Max 10 MB.` }, { status: 400 });
      }

      if (hash) {
        const existingProductImage = await prisma.productImage.findFirst({
          where: { imageHash: hash },
          select: { url: true, publicId: true, width: true, height: true, format: true, bytes: true, blurDataURL: true },
          orderBy: { createdAt: "desc" },
        });

        if (existingProductImage) {
          results.push({
            url: existingProductImage.url,
            publicId: existingProductImage.publicId,
            width: existingProductImage.width,
            height: existingProductImage.height,
            format: existingProductImage.format,
            bytes: existingProductImage.bytes,
            filename: file.name,
            imageHash: hash,
            blurDataURL: existingProductImage.blurDataURL || "",
            duplicate: true,
          });
          continue;
        }

        const existingTempUpload = await prisma.tempUpload.findFirst({
          where: { imageHash: hash, isAttached: true },
          select: { publicId: true, secureUrl: true, bytes: true, width: true, height: true, format: true },
          orderBy: { createdAt: "desc" },
        });

        if (existingTempUpload) {
          results.push({
            url: existingTempUpload.secureUrl,
            publicId: existingTempUpload.publicId,
            width: existingTempUpload.width,
            height: existingTempUpload.height,
            format: existingTempUpload.format,
            bytes: existingTempUpload.bytes,
            filename: file.name,
            imageHash: hash,
            blurDataURL: "",
            duplicate: true,
          });
          continue;
        }
      }

      // Pre-flight check + upload
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      const uploadResult = await safeUploadImage(dataUri, uploadFolder);

      if (uploadResult.error && !uploadResult.error.ok) {
        logError(uploadResult.error.code, "PRODUCT_UPLOAD", { message: uploadResult.error.message });
        return NextResponse.json({
          error: "Upload failed",
          detail: uploadResult.error.message,
          code: uploadResult.error.code,
        }, { status: 500 });
      }

      if (!uploadResult.data) {
        return NextResponse.json({ error: "Upload failed: no image data returned" }, { status: 500 });
      }

      const uploaded = uploadResult.data;

      if (uploaded.width < MIN_DIMENSION || uploaded.height < MIN_DIMENSION) {
        return NextResponse.json(
          { error: `Image too small: ${file.name}. Minimum ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.` },
          { status: 400 },
        );
      }

      if (uploaded.width > MAX_DIMENSION || uploaded.height > MAX_DIMENSION) {
        return NextResponse.json(
          { error: `Image too large: ${file.name}. Maximum ${MAX_DIMENSION}x${MAX_DIMENSION} pixels.` },
          { status: 400 },
        );
      }

      const blurDataURL = "";

      try {
        await prisma.tempUpload.create({
          data: {
            publicId: uploaded.publicId,
            secureUrl: uploaded.url,
            imageHash: hash,
            bytes: uploaded.bytes,
            width: uploaded.width,
            height: uploaded.height,
            format: uploaded.format,
            filename: file.name,
            createdBy: admin?.id || "",
            isAttached: false,
          },
        });
      } catch {}

      results.push({
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        filename: file.name,
        imageHash: hash,
        blurDataURL,
        duplicate: false,
      });
    }

    return NextResponse.json({ images: results });
  } catch (err) {
    logError(err, "PRODUCT_UPLOAD");
    return NextResponse.json({
      error: "Upload failed",
      detail: err instanceof Error ? err.message : "Unknown server error",
    }, { status: 500 });
  }
}
