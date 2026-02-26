import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppBar } from "./components";
import PwaServiceWorker from "./PwaServiceWorker";
import Providers from "./providers";
import UserSettingsBootstrap from "./UserSettingsBootstrap";

export const metadata: Metadata = {
  title: "It",
  description: "Learning through testing",
  manifest: "/manifest.webmanifest",
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
            <AppBar />
            <main className="flex flex-1 flex-col p-4">{main}</main>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
