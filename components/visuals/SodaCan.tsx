import React from "react";

type SodaCanProps = {
  width?: number;
  height?: number;
  accent?: string;
  label?: string;
};

export function SodaCan({ width = 240, height = 320, accent = "#C8A96A", label = "" }: SodaCanProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 240 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f6f6f5" />
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.14" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
        </linearGradient>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="20" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      <g filter="url(#s)">
        <rect x="36" y="20" rx="20" ry="20" width="168" height="280" fill="url(#g1)" />
        <rect x="36" y="20" rx="20" ry="20" width="168" height="280" fill="url(#g2)" />
        <rect x="36" y="20" rx="20" ry="20" width="168" height="48" fill="#fff" opacity="0.6" />
      </g>

      <text x="120" y="180" textAnchor="middle" fontFamily="Cormorant, Georgia, serif" fontSize="28" fill="#111" style={{ letterSpacing: "-0.02em" }}>
        {label}
      </text>

      <circle cx="120" cy="240" r="28" fill={accent} opacity="0.09" />
    </svg>
  );
}

export default SodaCan;
