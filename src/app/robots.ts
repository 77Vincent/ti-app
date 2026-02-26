import type { MetadataRoute } from "next";

function readSiteUrl(): string {
  const fallback = "http://localhost:3000";
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || fallback;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

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
