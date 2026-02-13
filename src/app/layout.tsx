import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "katex/dist/katex.min.css";
import "./globals.css";
import AppBar from "./appbar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "It",
  description: "Learning through testing",
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
          <div className="bg-background text-foreground flex min-h-dvh flex-col">
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
