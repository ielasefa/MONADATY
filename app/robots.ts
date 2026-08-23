import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/env-validator";

export const dynamic = "force-dynamic";

const siteUrl = getCanonicalSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/wishlist", "/offline", "/uploads"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
