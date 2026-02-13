"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider
          maxVisibleToasts={3}
          placement="bottom-center"
          toastOffset={16}
        />
        {children}
      </ThemeProvider>
    </HeroUIProvider>
  );
}
