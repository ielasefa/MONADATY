export function hexToRgba(hex: string | null | undefined, alpha: number): string {
  const value = (hex || "").trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(value);
  if (!m) {
    return `rgba(184,155,94,${alpha})`;
  }
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
