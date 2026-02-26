import type { MetadataRoute } from "next";
import { readSiteUrl } from "@/lib/config/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = readSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/dashboard/",
        "/run",
        "/signin",
        "/test",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
