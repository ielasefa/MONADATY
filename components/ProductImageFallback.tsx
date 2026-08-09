import { useId } from "react";
import { getProductFallbackProfile, type ProductImageSubject } from "@/lib/product-images";

type ProductImageFallbackProps = {
  product: ProductImageSubject;
  className?: string;
};

export function ProductImageFallback({ product, className = "" }: ProductImageFallbackProps) {
  const profile = getProductFallbackProfile(product);
  const uid = useId().replace(/:/g, "");
  const bodyGradient = `product-body-${uid}`;
  const shineGradient = `product-shine-${uid}`;
  const shadow = `product-shadow-${uid}`;
  const label = profile.brandLabel;

  return (
    <div
      className={`flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_64%)] p-[8%] ${className}`}
      role="img"
      aria-label={`${product.name} product illustration`}
      data-product-fallback={profile.format}
      data-product-kind={profile.kind}
    >
      <svg viewBox="0 0 320 400" className="h-full w-full drop-shadow-[0_24px_32px_rgba(0,0,0,0.35)]" aria-hidden="true">
        <defs>
          <linearGradient id={bodyGradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={profile.secondary} stopOpacity="0.92" />
            <stop offset="0.42" stopColor={profile.accent} />
            <stop offset="1" stopColor={profile.accent} stopOpacity="0.72" />
          </linearGradient>
          <linearGradient id={shineGradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="0.48" stopColor="#FFFFFF" stopOpacity="0.34" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
          </linearGradient>
          <filter id={shadow} x="-30%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        <ellipse cx="160" cy="365" rx={profile.format === "jug" || profile.format === "pack" ? 92 : 68} ry="13" fill="#000" opacity="0.24" />

        {profile.format === "pack" ? (
          <g filter={`url(#${shadow})`}>
            <rect x="52" y="79" width="216" height="272" rx="28" fill="#DDF5FC" fillOpacity="0.2" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="3" />
            {[82, 137, 192].map((x) => (
              <g key={x}>
                <rect x={x + 17} y="64" width="28" height="18" rx="4" fill={profile.accent} />
                <path d={`M${x + 18} 80h26v25c0 7 5 12 11 18 13 12 18 29 18 49v128c0 18-11 28-27 28H${x + 16}c-16 0-27-10-27-28V172c0-20 5-37 18-49 6-6 11-11 11-18z`} fill={profile.kind === "water" ? "#DDF5FC" : profile.secondary} fillOpacity="0.92" />
                <rect x={x + 3} y="183" width="56" height="62" rx="10" fill={profile.accent} />
              </g>
            ))}
            <rect x="67" y="210" width="186" height="82" rx="15" fill="#0B0B0A" fillOpacity="0.78" />
          </g>
        ) : profile.format === "can" ? (
          <g filter={`url(#${shadow})`}>
            <rect x="85" y="38" width="150" height="308" rx="34" fill={`url(#${bodyGradient})`} />
            <ellipse cx="160" cy="49" rx="67" ry="15" fill="#D9D8D2" />
            <ellipse cx="160" cy="48" rx="43" ry="8" fill="#8D8C86" opacity="0.6" />
            <path d="M116 57v265" stroke={`url(#${shineGradient})`} strokeWidth="16" strokeLinecap="round" />
            <rect x="91" y="142" width="138" height="105" rx="16" fill="#0B0B0A" fillOpacity="0.72" />
          </g>
        ) : profile.format === "carton" ? (
          <g filter={`url(#${shadow})`}>
            <path d="M94 75l40-35h91v310H94z" fill={`url(#${bodyGradient})`} />
            <path d="M134 40l-40 35h91l40-35z" fill={profile.secondary} />
            <path d="M185 75h40v275h-40z" fill="#000" opacity="0.15" />
            <rect x="104" y="145" width="111" height="103" rx="12" fill="#0B0B0A" fillOpacity="0.7" />
          </g>
        ) : profile.format === "jug" ? (
          <g filter={`url(#${shadow})`}>
            <rect x="135" y="27" width="50" height="31" rx="6" fill={profile.accent} />
            <path d="M119 52h82l10 33c28 11 40 37 40 70v157c0 29-19 43-45 43h-92c-27 0-45-14-45-43V155c0-35 14-61 41-72z" fill={profile.kind === "water" ? "#DDF5FC" : `url(#${bodyGradient})`} fillOpacity="0.95" />
            <path d="M194 98c33 1 43 18 43 48v65h-35v-55c0-19-7-27-22-28z" fill="#0B0B0A" fillOpacity="0.75" />
            <rect x="77" y="190" width="142" height="86" rx="15" fill={profile.accent} />
            <path d="M101 94v235" stroke="#FFFFFF" strokeOpacity="0.36" strokeWidth="12" strokeLinecap="round" />
          </g>
        ) : profile.format === "glass" ? (
          <g filter={`url(#${shadow})`}>
            <path d="M87 62h146l-20 284H107z" fill="#FFFFFF" fillOpacity="0.16" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="4" />
            <path d="M103 137h114l-14 191h-86z" fill={profile.liquid} fillOpacity="0.84" />
            <ellipse cx="160" cy="137" rx="57" ry="10" fill={profile.secondary} />
            <rect x="111" y="181" width="98" height="78" rx="12" fill="#0B0B0A" fillOpacity="0.7" />
          </g>
        ) : (
          <g filter={`url(#${shadow})`}>
            <rect x="132" y="25" width="56" height="28" rx="6" fill={profile.accent} />
            <path d="M137 50h46v42c0 10 7 18 17 26 22 18 31 44 31 77v116c0 29-18 43-43 43h-56c-25 0-43-14-43-43V195c0-33 9-59 31-77 10-8 17-16 17-26z" fill={profile.kind === "water" ? "#DDF5FC" : `url(#${bodyGradient})`} fillOpacity="0.96" />
            <path d="M124 111c-16 22-21 48-21 83v112c0 19 6 29 19 35" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="10" strokeLinecap="round" />
            <rect x="99" y="177" width="122" height="102" rx="18" fill={profile.accent} />
            <rect x="107" y="185" width="106" height="86" rx="13" fill="#0B0B0A" fillOpacity="0.72" />
          </g>
        )}

        <g fill="#FFFFFF" textAnchor="middle">
          <text x="160" y={profile.format === "pack" ? 239 : profile.format === "jug" ? 224 : profile.format === "carton" ? 181 : 215} fontSize={label.length > 12 ? "14" : "17"} fontWeight="700" letterSpacing="1.2">
            {label}
          </text>
          <text x="160" y={profile.format === "pack" ? 262 : profile.format === "jug" ? 246 : profile.format === "carton" ? 204 : 239} fontSize="10" fontWeight="600" letterSpacing="2.4" opacity="0.7">
            {profile.detailLabel}
          </text>
          {profile.sizeLabel ? (
            <text x="160" y={profile.format === "pack" ? 280 : profile.format === "jug" ? 263 : profile.format === "carton" ? 226 : 258} fontSize="9" fontWeight="600" letterSpacing="1.6" opacity="0.55">
              {profile.sizeLabel}
            </text>
          ) : null}
        </g>
      </svg>
    </div>
  );
}
