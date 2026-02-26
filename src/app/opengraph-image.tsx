import { ImageResponse } from "next/og";
import { readSiteUrl } from "@/lib/config/siteUrl";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  const logoUrl = `${readSiteUrl()}/logo.svg`;

  return new ImageResponse(
    (
      <img
        alt="Ti Logo"
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
