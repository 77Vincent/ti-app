import type { MetadataRoute } from "next";

function readSiteUrl(): string {
  const fallback = "http://localhost:3000";
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || fallback;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = readSiteUrl();
  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
