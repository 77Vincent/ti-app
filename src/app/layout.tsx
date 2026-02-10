import type { Metadata } from "next";
import ToastHost from "@/modules/toast/ToastHost";
import "katex/dist/katex.min.css";
import "./globals.css";
import AppBar from "./appbar";
import { ThemeProvider } from "next-themes";

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
      <body className="antialiased min-h-screen bg-base-200 text-base-content">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
        >
          <AppBar />
          <ToastHost />
          <main>
            {main}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
