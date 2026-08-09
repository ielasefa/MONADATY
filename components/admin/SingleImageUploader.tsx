"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  aspectRatio?: string;
  className?: string;
  fieldName?: string;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024;
const MAX_LONGEST = 2048;
const COMPRESS_QUALITY = 0.82;

function getExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

function validateFile(file: File): string | null {
  const ext = getExtension(file.name);
  if (!["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) {
    return `Invalid extension ".${ext}". Allowed: jpg, png, webp, avif`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid type "${file.type}"`;
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`;
  }
  return null;
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
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
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

export function SingleImageUploader({ value, onChange, label, folder = "products", aspectRatio, className = "", fieldName }: Props) {
  const { t } = useTranslation("admin");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    let processed = file;
    try {
      processed = await compressImage(file);
    } catch { /* use original */ }

    const localUrl = URL.createObjectURL(processed);
    setPreview(localUrl);
    setUploading(true);
    setProgress(0);
    setProcessing(false);
    setCompleted(false);

    try {
      const formData = new FormData();
      formData.append("files", processed);
      formData.append("folder", folder);

      const xhr = new XMLHttpRequest();
      const result = await new Promise<any>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90));
          }
        };
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

      const img = result.images?.[0];
      if (!img) throw new Error(t("no_image_returned"));

      setProgress(100);
      setUploading(false);
      setProcessing(true);
      onChange(img.url);
      setPreview(img.url);

      await new Promise((r) => setTimeout(r, 400));

      setProcessing(false);
      setCompleted(true);
      setTimeout(() => setCompleted(false), 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setProcessing(false);
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreview("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="luxury-label">{label}</label>}
      {fieldName && <input type="hidden" name={fieldName} value={value} />}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleInputChange} />
      <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" capture="environment" className="hidden" onChange={handleCameraCapture} />

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#171717]" style={aspectRatio ? { aspectRatio } : {}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={t("preview")} className="h-48 w-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="mb-2 h-2 w-32 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-white">{progress}%</p>
              </div>
            </div>
          )}
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <svg className="mx-auto mb-2 animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D5B87D" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p className="text-xs text-white">{t("processing", "Processing...")}</p>
              </div>
            </div>
          )}
          {completed && !uploading && !processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-emerald-400">{t("upload_completed", "Upload completed")}</p>
              </div>
            </div>
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded bg-white/20 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
              aria-label={t("replace_image")}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded bg-red/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-red/80"
              aria-label={t("remove_image")}
            >
              {t("remove_image")}
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) setDragOver(false); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition ${
            dragOver ? "border-yellow bg-yellow/5" : "border-white/[0.08] hover:border-white/20"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D5B87D" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-white/80">{t("drop_image")}</p>
          <p className="mt-1 text-xs text-white/50">{t("upload_formats_hint", "JPG, PNG, WebP, AVIF — Up to 10 MB")}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }}
            className="mt-3 inline-flex h-8 items-center rounded-md border border-white/[0.12] bg-white/5 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/10"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Camera
          </button>
        </div>
      )}

      {uploading && <p className="text-xs text-yellow">{t("uploading", "Uploading")}... {progress}%</p>}
      {processing && <p className="text-xs text-yellow">{t("processing", "Processing...")}</p>}
      {completed && !uploading && !processing && <p className="text-xs text-emerald-400">{t("upload_completed", "Upload completed")}</p>}
      <input type="hidden" name="image" value={value} />
    </div>
  );
}
