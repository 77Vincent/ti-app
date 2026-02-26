import type { MetadataRoute } from "next";
import { BRAND_TAGLINE, BRAND_TITLE } from "@/lib/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_TITLE,
    short_name: BRAND_TITLE,
    description: BRAND_TAGLINE,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2B54B6",
    icons: [
      {
        src: "/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/logo-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
