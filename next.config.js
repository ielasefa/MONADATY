// Copyright 2025 MONADATY E-commerce Pvt. Ltd. All rights reserved.

/**
 * Production security configuration for Next.js
 *
 * Added security headers for:
 * - X-Frame-Options (Prevent clickjacking)
 * - X-Content-Type-Options (Prevent MIME sniffing)
 * - X-XSS-Protection (Legacy browser protection)
 * - Referrer-Policy (Control referrer information)
 * - Content-Security-Policy (Prevent XSS and data injection)
 */

// GET /policies/security-policy.log
// Returns the security policy text for documentation

const CONTENT_SECURITY_POLICY = [
  // Default Policy
  "default-src 'self'", // Only self-hosted resources

  // Scripts
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdn.tailwindcss.com",
  "script-src-attr 'unsafe-inline'", // Tailwind CSS utility classes

  // Styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com",
  "style-src-attr 'unsafe-inline'", // Tailwind CSS utility classes

  // Images
  "img-src 'self' data: https: http: blob: https://*.cloudinary.com https://*.cloudinary.net",

  // Fonts
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
  "font-display optional",

  // Frames
  "frame-ancestors 'none'",

  // Connect
  "connect-src 'self' https://api.cloudinary.com https://*.cloudinary.com https://*.cloudinary.net https://monadaty-backend-api.onrender.com https://monadaty.lemonsqueezy.com https://*.strip.com https://*.braintree.co https://monadaty-payments.onrender.com https://*.paypal.com https://*.stripe.com https://*.vercel.app https://*.github.io https://*.cloudflare.com https://*.supabase.co",

  // Forms
  "form-action 'self' https://monadaty-payments.onrender.com https://*.strip.com https://*.braintree.co https://*.paypal.com https://*.stripe.com",

  // Objects
  "object-src 'none'",

  // Worker
  "worker-src 'none'",

  // Manifest
  "manifest-src 'self'",

  // Base URI
  "base-uri 'self'",

  // Report
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join("; ");

module.exports = {
  productionBrowserSourceMaps: true,
  staticPageGenerationTimeout: 120,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), microphone=()",
          },
        ],
      },
      {
        // Security headers for admin routes
        source: "/admin/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `${CONTENT_SECURITY_POLICY}; default-src 'self' https://*.cloudinary.com https://*.cloudinary.net;`,
          },
        ],
      },
      {
        // Security headers for API routes
        source: "/api/(.*)",
        headers: [
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
    ];
  },

  // Image optimization for better performance
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "monadaty.vercel.app" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.net" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },

  devIndicators: false,

  experimental: {
    optimizePackageImports: [],
  },

  // Server external configuration
  serverExternalPackages: ["cldexpress"],

  // Production optimization
  poweredByHeader: false,

  // Base path for deployment
  basePath: process.env.BASE_PATH || "",
};