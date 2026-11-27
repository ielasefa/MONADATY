import type { MetadataRoute } from "next";

const siteName = process.env.APP_NAME || "MONADATY";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: "Commandez vos boissons en gros pour épiceries, cafés, restaurants et commerces, avec livraison jusqu’à vous.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#780B10",
    orientation: "portrait-primary",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/icons/icon-192.png?v=monadaty-3",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png?v=monadaty-3",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png?v=monadaty-3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    lang: "ar",
    dir: "rtl",
    scope: "/",
    id: "/",
    prefer_related_applications: false,
  };
}
