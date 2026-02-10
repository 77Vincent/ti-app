"use client";

import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
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
    <Navbar height={60} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Image src="/logo.svg" alt="QuizMaster Logo" width={48} height={40} />
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            isIconOnly
            onPress={handleToggleTheme}
            radius="full"
            size="sm"
            variant="bordered"
          >
            {isDark ? (
              <Sun aria-hidden="true" size={18} />
            ) : (
              <Moon aria-hidden="true" size={18} />
            )}
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
