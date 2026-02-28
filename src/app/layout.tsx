import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import "katex/dist/katex.min.css";
import "./globals.css";
import { BRAND_DESCRIPTION, BRAND_TITLE } from "@/lib/config/brand";
import { readSiteUrl } from "@/lib/config/siteUrl";
import { AppBar } from "./components";
import PwaServiceWorker from "./PwaServiceWorker";
import Providers from "./providers";
import UserSettingsBootstrap from "./components/UserSettingsBootstrap";

export const metadata: Metadata = {
  metadataBase: new URL(readSiteUrl()),
  title: BRAND_TITLE,
  description: BRAND_DESCRIPTION,
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children: main,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <UserSettingsBootstrap />
          <PwaServiceWorker />
          <NextTopLoader color="#2B54B6" showSpinner={false} />
          <div className="bg-gradient-to-t from-primary-500/30 via-success-50/20 to-background text-foreground flex min-h-dvh flex-col">
            <div className="hidden sm:block">
              <AppBar />
            </div>
            <main className="flex flex-1 flex-col px-4 pb-4 pt-[calc(env(safe-area-inset-top,0px)+0.25rem)] sm:p-4">{main}</main>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
