// Copyright 2025 MONADATY E-commerce Pvt. Ltd. All rights reserved.

// GET /policies/security-policy.log
// Returns the security policy text for documentation

const isDev = process.env.NODE_ENV === "development";

function buildCSP() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "form-action 'self'",
    "manifest-src 'self'",

    // Scripts
    "script-src 'self' 'unsafe-inline'" + (isDev ? " 'unsafe-eval'" : ""),
    "script-src-attr 'unsafe-inline'",

    // Styles
    "style-src 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",

    // Images
    "img-src 'self' data: blob:",

    // Fonts
    "font-src 'self' data:",

    // Workers
    "worker-src 'self'",

    // Connections
    "connect-src 'self'" + (isDev ? " ws: wss:" : ""),
  ];

  return directives.join("; ");
}

const CONTENT_SECURITY_POLICY = buildCSP();

module.exports = {
  // IMPORTANT FOR AZURE DEPLOYMENT
  output: "standalone",
  deploymentId: process.env.DEPLOYMENT_VERSION,

  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 120,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: CONTENT_SECURITY_POLICY,
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, max-age=0, must-revalidate, s-maxage=0, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "monadaty.vercel.app",
      },
      {
        protocol: "https",
        hostname: "monadaty-ilyas.azurewebsites.net",
      },
      {
        protocol: "https",
        hostname: "monadaty.com",
      },
      {
        protocol: "https",
        hostname: "www.monadaty.com",
      },
    ],

    formats: ["image/avif", "image/webp"],

    deviceSizes: [
      640,
      750,
      828,
      1080,
      1200,
      1920,
      2048,
      3840,
    ],

    imageSizes: [
      16,
      32,
      48,
      64,
      96,
      128,
      256,
      384,
      512,
    ],

    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  devIndicators: false,

  experimental: {
    optimizePackageImports: [],
  },

  serverExternalPackages: [
    "@prisma/adapter-pg",
  ],

  poweredByHeader: false,

  basePath: process.env.BASE_PATH || "",
};
