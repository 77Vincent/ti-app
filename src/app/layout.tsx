import type { Metadata } from "next";
import ToastHost from "@/modules/toast/ToastHost";
import Image from "next/image";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        <aside className="w-20">
          <Image
            src="/logo.svg"
            alt="QuizMaster Logo"
            width={48}
            height={40}
          />          
        </aside>
        {main}
        <ToastHost />
      </body>
    </html>
  );
}
