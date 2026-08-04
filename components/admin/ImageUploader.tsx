"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { StoredProductImage } from "@/types";

type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  imageHash: string;
  blurDataURL: string;
  duplicate: boolean;
};

type UploadingFile = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  width: number;
  height: number;
  status: "pending" | "uploading" | "processing" | "done" | "error" | "duplicate";
  result?: UploadResult;
  error?: string;
};

type Props = {
  images: StoredProductImage[];
  onChange: (images: StoredProductImage[]) => void;
  maxFiles?: number;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif"];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_LONGEST = 2048;
const COMPRESS_QUALITY = 0.82;

let uploadIdCounter = 0;
function nextId() {
  return `upload-${++uploadIdCounter}-${Date.now()}`;
}

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function validateFile(file: File): string | null {
  const ext = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Invalid extension ".${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid type "${file.type}". Allowed: JPG, PNG, WebP, AVIF`;
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`;
  }
  return null;
}

async function sha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > MAX_LONGEST || height > MAX_LONGEST) {
        const ratio = Math.min(MAX_LONGEST / width, MAX_LONGEST / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      if (width === img.naturalWidth && height === img.naturalHeight && file.size < 500 * 1024) {
        resolve(file);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
            });
            resolve(compressed);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        COMPRESS_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  });
}

export function ImageUploader({ images, onChange, maxFiles = 10 }: Props) {
  const { t } = useTranslation("admin");
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<UploadingFile[]>([]);
  const imagesRef = useRef(images);
  const onChangeRef = useRef(onChange);
  const processingRef = useRef(false);
  const uploadingRef = useRef<UploadingFile[]>([]);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  imagesRef.current = images;
  onChangeRef.current = onChange;

  const clearCompletedItems = useCallback(() => {
    setUploading((prev) => {
      const completed = prev.filter(
        (u) => u.status === "done" || u.status === "duplicate" || u.status === "error",
      );
      for (const item of completed) {
        if (previewUrlsRef.current.has(item.preview)) {
          URL.revokeObjectURL(item.preview);
          previewUrlsRef.current.delete(item.preview);
        }
      }
      const remaining = prev.filter(
        (u) => u.status === "pending" || u.status === "uploading" || u.status === "processing",
      );
      uploadingRef.current = remaining;
      return remaining;
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      const pending = queueRef.current.filter((u) => u.status === "pending");
      if (pending.length === 0) {
        return;
      }

      const batch = pending.slice(0, 3);
      queueRef.current = queueRef.current.filter((u) => !batch.includes(u));

      let batchSuccessCount = 0;

      await Promise.allSettled(
        batch.map(async (item) => {
          setUploading((prev) => {
            const next = prev.map((u) =>
              u.id === item.id ? { ...u, status: "uploading" as const, progress: 0 } : u,
            );
            uploadingRef.current = next;
            return next;
          });

          try {
            const formData = new FormData();
            formData.append("files", item.file);
            formData.append("hashes", item.id.replace("upload-", ""));

            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                setUploading((prev) => {
                  const next = prev.map((u) =>
                    u.id === item.id ? { ...u, progress: pct } : u,
                  );
                  uploadingRef.current = next;
                  return next;
                });
              }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await new Promise<any>((resolve, reject) => {
              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  resolve(JSON.parse(xhr.responseText));
                } else {
                  reject(new Error(`Upload failed: ${xhr.status}`));
                }
              };
              xhr.onerror = () => reject(new Error("Network error"));
              xhr.open("POST", "/api/admin/products/upload");
              xhr.send(formData);
            });

            const img = result.images?.[0] as UploadResult;
            if (!img) throw new Error(t("no_image_returned"));

            const isDuplicate = img.duplicate;

            setUploading((prev) => {
              const next = prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: "processing" as const, progress: 100 }
                  : u,
              );
              uploadingRef.current = next;
              return next;
            });

            await new Promise((r) => setTimeout(r, 400));

            setUploading((prev) => {
              const next = prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: isDuplicate ? ("duplicate" as const) : ("done" as const) }
                  : u,
              );
              uploadingRef.current = next;
              return next;
            });

            batchSuccessCount++;

            if (isDuplicate) {
              setDuplicateMessage("Image already exists. Existing asset reused.");
              setTimeout(() => setDuplicateMessage(""), 4000);
            }

            const newImage: StoredProductImage = {
              id: `new-${item.id}`,
              url: img.url,
              alt: item.file.name.replace(/\.[^.]+$/, ""),
              sortOrder: imagesRef.current.length + 1,
              isCover: imagesRef.current.length === 0,
              width: img.width || item.width,
              height: img.height || item.height,
              format: img.format,
              publicId: img.publicId || "",
              bytes: img.bytes || 0,
              imageHash: img.imageHash || "",
              blurDataURL: img.blurDataURL || "",
            };
            imagesRef.current = [...imagesRef.current, newImage];
            onChangeRef.current(imagesRef.current);
          } catch (err: unknown) {
            setUploading((prev) => {
              const next = prev.map((u) =>
                u.id === item.id
                  ? { ...u, status: "error" as const, error: err instanceof Error ? err.message : "Upload failed" }
                  : u,
              );
              uploadingRef.current = next;
              return next;
            });
          }
        }),
      );

      if (batchSuccessCount > 0) {
        setSuccessMessage(t("upload_completed", "Upload completed"));
      }
    } finally {
      processingRef.current = false;
      const stillPending = queueRef.current.filter((u) => u.status === "pending").length;
      if (stillPending > 0) {
        processQueue();
      }
    }
  }, [t]);

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setValidationError("");
      setDuplicateMessage("");
      setSuccessMessage("");
      const files = Array.from(fileList);
      const currentCount = imagesRef.current.length;
      const uploadingCount = uploadingRef.current.filter(
        (u) => u.status === "pending" || u.status === "uploading" || u.status === "processing",
      ).length;
      const remaining = maxFiles - currentCount - uploadingCount;

      const valid: UploadingFile[] = [];
      for (const file of files) {
        if (valid.length >= remaining) break;
        const error = validateFile(file);
        if (error) {
          setValidationError(error);
          continue;
        }
        let processed = file;
        try {
          processed = await compressImage(file);
        } catch { /* use original */ }

        const preview = URL.createObjectURL(processed);
        previewUrlsRef.current.add(preview);
        const dims = new Image();
        dims.src = preview;

        const id = nextId();

        dims.onload = () => {
          const entry = valid.find((v) => v.id === id);
          if (entry) {
            entry.width = dims.naturalWidth;
            entry.height = dims.naturalHeight;
          }
        };

        valid.push({
          id,
          file: processed,
          preview,
          progress: 0,
          width: 0,
          height: 0,
          status: "pending",
        });
      }

      if (valid.length === 0) return;

      const hashEntries = await Promise.all(
        valid.map(async (v) => ({
          ...v,
          id: `upload-${await sha256(v.file)}`,
        }))
      );

      const finalUploading = hashEntries.map((v) => ({
        ...v,
        id: nextId(),
      }));

      setUploading((prev) => {
        const next = [...prev, ...finalUploading];
        uploadingRef.current = next;
        return next;
      });
      queueRef.current = [...queueRef.current, ...finalUploading];
      processQueue();
    },
    [maxFiles, processQueue],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index]?.isCover && updated.length > 0) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const handleSetCover = (index: number) => {
    const updated = images.map((img, i) => ({ ...img, isCover: i === index }));
    onChange(updated);
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  const handleRetry = (uploadItem: UploadingFile) => {
    queueRef.current = [uploadItem, ...queueRef.current];
    setUploading((prev) =>
      prev.map((u) =>
        u.id === uploadItem.id ? { ...u, status: "pending" as const, progress: 0, error: undefined } : u,
      ),
    );
    processQueue();
  };

  const handleDismissCompleted = () => {
    clearCompletedItems();
    setSuccessMessage("");
  };

  const totalImages = images.length;
  const canAddMore = totalImages < maxFiles;
  const hasCompleted = uploading.some((u) => u.status === "done" || u.status === "duplicate");
  const hasActive = uploading.some((u) => u.status === "pending" || u.status === "uploading" || u.status === "processing");

  return (
    <div className="space-y-4">
      {validationError && (
        <div className="rounded-lg border border-red/20 bg-red/10 px-4 py-2 text-xs text-red">
          {validationError}
      </div>
      )}

      {duplicateMessage && (
        <div className="rounded-lg border border-yellow/20 bg-yellow/5 px-4 py-2 text-xs text-yellow">
          {duplicateMessage}
      </div>
      )}

      {successMessage && !hasActive && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-400" data-testid="upload-success-banner">
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMessage}
          </span>
          <button
            type="button"
            onClick={handleDismissCompleted}
            className="ml-3 rounded bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-400 transition hover:bg-emerald-400/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        capture="environment"
        className="hidden"
        onChange={handleCameraCapture}
        aria-hidden="true"
      />

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver
            ? "border-yellow bg-yellow/5"
            : "border-white/[0.08] hover:border-white/20"
        } ${!canAddMore ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D5B87D" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="text-sm text-white/80">
          {canAddMore ? t("drag_drop_images") : t("max_images")}
        </p>
        <p className="mt-1 text-xs text-white/50">
          JPG, PNG, WebP, AVIF &mdash; Up to 10 MB each &mdash; Max {maxFiles} images
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => canAddMore && inputRef.current?.click()}
            className="inline-flex h-9 items-center rounded-md border border-white/[0.12] bg-white/5 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
           </svg>
            Browse Files
        </button>
          <button
            type="button"
            onClick={() => canAddMore && cameraRef.current?.click()}
            className="inline-flex h-9 items-center rounded-md border border-white/[0.12] bg-white/5 px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera
          </button>
        </div>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2" data-testid="upload-queue">
          {uploading.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                item.status === "done"
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : item.status === "error"
                    ? "border-burgundy/20 bg-burgundy/5"
                    : "border-white/[0.06] bg-bg"
              }`}
              data-upload-status={item.status}
              data-testid={`upload-item-${item.status}`}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">{item.file.name}</p>
                <p className="text-xs text-white/50">
                  {item.width > 0 && item.height > 0
                    ? `${item.width} × ${item.height} — `
                    : ""}
                  {(item.file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                {(item.status === "uploading" || item.status === "processing") && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-yellow transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && (
                  <p className="mt-1 text-xs text-red">{item.error || "Upload failed"}</p>
                )}
              </div>
              <div className="shrink-0">
                {item.status === "pending" && (
                  <span className="flex items-center gap-1.5 text-xs text-white/50" data-testid="upload-status-pending">
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                   </svg>
                    {t("waiting", "Waiting...")}
                </span>
                )}
                {item.status === "uploading" && (
                  <span className="text-xs font-medium text-yellow" data-testid="upload-status-uploading">
                    {item.progress}%
                </span>
                )}
                {item.status === "processing" && (
                  <span className="flex items-center gap-1.5 text-xs text-yellow" data-testid="upload-status-processing">
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                   </svg>
                    {t("processing", "Processing...")}
                </span>
                )}
                {item.status === "done" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400" data-testid="upload-status-completed">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                   </svg>
                    {t("upload_completed", "Completed")}
                </span>
                )}
                {item.status === "duplicate" && (
                  <span className="flex items-center gap-1 text-xs text-yellow" data-testid="upload-status-duplicate">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D5B87D" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                   </svg>
                    {t("duplicate", "Duplicate")}
                </span>
                )}
                {item.status === "error" && (
                  <button
                    onClick={() => handleRetry(item)}
                    className="text-xs font-semibold text-yellow transition hover:brightness-110"
                    aria-label={t("retry_upload")}
                    data-testid="upload-retry"
                  >
                    {t("retry_upload")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dismiss completed items button */}
      {hasCompleted && !hasActive && uploading.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleDismissCompleted}
            className="text-xs text-white/50 transition hover:text-white"
          >
            {t("clear_completed", "Clear completed")}
          </button>
        </div>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded-lg border ${
                img.isCover ? "border-yellow" : "border-white/[0.06]"
              } bg-[#171717]`}
            >
              <div className="aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt || ""}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {img.isCover && (
                <span className="absolute left-1.5 top-1.5 rounded bg-yellow/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black">
                  Cover
              </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {!img.isCover && (
                  <button
                    onClick={() => handleSetCover(idx)}
                    className="rounded bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition hover:bg-white/30"
                    aria-label={t("set_as_cover", "Set as cover image")}
                  >
                    Cover
                  </button>
                )}
                <button
                  onClick={() => handleRemove(idx)}
                  className="rounded bg-red/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm transition hover:bg-red/80"
                  aria-label={t("remove_image")}
                >
                  {t("remove_image")}
                </button>
              </div>
              <div className="flex items-center justify-between px-1.5 py-1">
                <p className="truncate text-[10px] text-white/50">
                  {img.width > 0 && img.height > 0
                    ? `${img.width}×${img.height}`
                    : ""}
                  {img.bytes ? ` · ${(img.bytes / 1024 / 1024).toFixed(1)} MB` : ""}
                </p>
                <div className="flex gap-0.5">
                  {idx > 0 && (
                    <button
                      onClick={() => handleMoveImage(idx, idx - 1)}
                      className="rounded bg-white/10 p-0.5 text-white/50 transition hover:bg-white/20 hover:text-white"
                      aria-label={t("move_left")}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                     </svg>
                  </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      onClick={() => handleMoveImage(idx, idx + 1)}
                      className="rounded bg-white/10 p-0.5 text-white/50 transition hover:bg-white/20 hover:text-white"
                      aria-label={t("move_right")}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
