"use client";

import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      aria-label={label}
      title={label}
      isIconOnly
      onPress={() => setTheme(isDark ? "light" : "dark")}
      radius="full"
      size="sm"
      variant="light"
      startContent={
        isDark ? (
          <Sun aria-hidden="true" size={20} />
        ) : (
          <Moon aria-hidden="true" size={20} />
        )
      }
    />
  );
}
