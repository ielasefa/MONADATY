import React from "react";

type SodaBottleProps = {
  width?: number;
  height?: number;
  accent?: string;
  label?: string;
};

export function SodaBottle({ width = 220, height = 360, accent = "#C8A96A", label = "" }: SodaBottleProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 220 360" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label}>
      <defs>
        <linearGradient id="b1" x1="0" x2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#f8f6f3" />
        </linearGradient>
        <filter id="fb" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor="#000" floodOpacity="0.06" />
        </filter>
      </defs>

      <g filter="url(#fb)">
        <path d="M110 12c-8 0-12 6-12 14v24c-18 6-36 22-36 52 0 40 24 56 36 68v156c0 8 6 14 12 14s12-6 12-14V176c12-12 36-28 36-68 0-30-18-46-36-52V26c0-8-4-14-12-14z" fill="url(#b1)" />
      </g>

      <text x="110" y="210" textAnchor="middle" fontFamily="Cormorant, Georgia, serif" fontSize="26" fill="#111">
        {label}
      </text>

      <ellipse cx="110" cy="300" rx="46" ry="12" fill={accent} opacity="0.08" />
    </svg>
  );
}

export default SodaBottle;
