import { ImageResponse } from "next/og";
import { BRAND_TITLE } from "@/lib/config/brand";
import { readSiteUrl } from "@/lib/config/siteUrl";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const logoUrl = `${readSiteUrl()}/logo.svg`;
  const logoAlt = `${BRAND_TITLE} Logo`;

  return new ImageResponse(
    (
      <img
        alt={logoAlt}
        height={size.height}
        src={logoUrl}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#FFFFFF",
          padding: "64px",
        }}
        width={size.width}
      />
    ),
    size,
  );
}
