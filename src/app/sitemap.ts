import type { MetadataRoute } from "next";
import { readSiteUrl } from "@/lib/config/siteUrl";

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
