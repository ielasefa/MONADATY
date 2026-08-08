type IconProps = { className?: string; strokeWidth?: number };

function base(className?: string, strokeWidth = 1.6) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

export function IconChart({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 13l3-3 4 4 5-6" />
    </svg>
  );
}

export function IconRevenue({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M3 17l5-5 4 4 8-9" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function IconBag({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M6 7h12l1.2 12.2a1.6 1.6 0 0 1-1.6 1.8H6.4a1.6 1.6 0 0 1-1.6-1.8L6 7Z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

export function IconBox({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 2 4 6v12l8 4 8-4V6l-8-4Z" />
      <path d="m4 6 8 4 8-4" />
      <path d="M12 10v12" />
    </svg>
  );
}

export function IconUsers({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconTags({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a1.5 1.5 0 0 1 0 2.1Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function IconLayers({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

export function IconSparkles({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </svg>
  );
}

export function IconSettings({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function IconShield({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 2 4 5.5v5c0 5 3.4 8.9 8 10.5 4.6-1.6 8-5.5 8-10.5v-5L12 2Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconLayout({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v11" />
    </svg>
  );
}

export function IconDashboard({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <rect x="3" y="3" width="8" height="9" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="12" width="8" height="9" rx="2" />
      <rect x="3" y="16" width="8" height="5" rx="2" />
    </svg>
  );
}

export function IconLogout({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function IconPlus({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconRefresh({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

export function IconArrowUp({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

export function IconArrowDown({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function IconArrowRight({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function IconChevronRight({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function IconAlert({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconCheck({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconCalendar({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

export function IconUser({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

export function IconEye({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconTrophy({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M6 3h12v5a6 6 0 0 1-12 0V3Z" />
      <path d="M6 5H3a2 2 0 0 0 2 4h2" />
      <path d="M18 5h3a2 2 0 0 1-2 4h-2" />
    </svg>
  );
}

export function IconEmpty({ className, strokeWidth }: IconProps) {
  return (
    <svg {...base(className, strokeWidth)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}
