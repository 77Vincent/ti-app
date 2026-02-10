"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function AppBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  function handleToggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <header className="flex items-center justify-between p-4">
      <Image src="/logo.svg" alt="QuizMaster Logo" width={48} height={40} />

      <button
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className="btn btn-ghost btn-circle btn-sm"
        onClick={handleToggleTheme}
        type="button"
      >
        {isDark ? (
          <Sun aria-hidden="true" size={18} />
        ) : (
          <Moon aria-hidden="true" size={18} />
        )}
      </button>
    </header>
  );
}
