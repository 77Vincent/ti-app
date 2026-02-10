import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import AppBar from "./appbar";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "It",
  description: "Instant learning through testing",
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
          <main className="text-foreground bg-background">
            <AppBar />
            {main}
          </main>
        </Providers>
      </body>
    </html>
  );
}
