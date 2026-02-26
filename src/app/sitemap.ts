import type { MetadataRoute } from "next";
import { PAGE_PATHS } from "@/lib/config/paths";
import { readSiteUrl } from "@/lib/config/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = readSiteUrl();

  return [
    {
      url: `${siteUrl}${PAGE_PATHS.HOME}`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}${PAGE_PATHS.TERMS_OF_USE}`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}${PAGE_PATHS.PRIVACY_POLICY}`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
