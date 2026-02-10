import type { Metadata } from "next";
import ThemeProvider from "../features/theme/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "It",
  description: "Instant learning through testing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
