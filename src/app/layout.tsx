import type { Metadata } from "next";
import ToastHost from "@/modules/toast/ToastHost";
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
    <html lang="en">
      <body className="antialiased">
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
