import type { MetadataRoute } from "next";

const siteName = process.env.APP_NAME || "MONADATY";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: process.env.APP_DESCRIPTION || "Premium beverage delivery across Morocco.",
    start_url: "/",
    display: "standalone",
    background_color: "#090909",
    theme_color: "#090909",
    orientation: "portrait-primary",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    lang: "en",
    dir: "ltr",
    scope: "/",
    id: "/",
    prefer_related_applications: false,
  };
}
