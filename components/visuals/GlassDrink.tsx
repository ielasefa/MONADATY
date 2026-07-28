import React from "react";

type GlassDrinkProps = {
  width?: number;
  height?: number;
  accent?: string;
  label?: string;
};

export function GlassDrink({ width = 260, height = 280, accent = "#D5B87D", label = "" }: GlassDrinkProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 260 280" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
      <defs>
        <linearGradient id="gl1" x1="0" x2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#f7f7f6" />
        </linearGradient>
        <filter id="fg" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000" floodOpacity="0.055" />
        </filter>
      </defs>

      <g filter="url(#fg)">
        <rect x="48" y="28" rx="16" width="164" height="188" fill="url(#gl1)" />
        <ellipse cx="120" cy="228" rx="62" ry="12" fill={accent} opacity="0.06" />
      </g>

      <text x="120" y="140" textAnchor="middle" fontFamily="Cormorant, Georgia, serif" fontSize="24" fill="#111">
        {label}
      </text>
    </svg>
  );
}

export default GlassDrink;
