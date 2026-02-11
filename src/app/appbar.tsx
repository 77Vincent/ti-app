"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { LogIn, Moon, Sun, User } from "lucide-react";
import { getSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { type Key, useEffect, useState } from "react";
import { getGoogleSignInPath } from "./auth/googleSignIn";
import {
  hasAuthenticatedUser,
  USER_MENU_LOGOUT_KEY,
} from "./auth/sessionState";

export default function AppBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active) {
        return;
      }

      setIsAuthenticated(hasAuthenticatedUser(session));
    });

    return () => {
      active = false;
    };
  }, []);

  function handleToggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  function handleUserMenuAction(key: Key) {
    if (key === USER_MENU_LOGOUT_KEY) {
      void signOut();
    }
  }

  return (
    <Navbar height={60} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Image src="/logo.svg" alt="QuizMaster Logo" width={48} height={40} />
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          {isAuthenticated ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  color="primary"
                  icon={<User aria-hidden="true" size={18} />}
                  size="sm"
                />
              </DropdownTrigger>

              <DropdownMenu aria-label="User menu" onAction={handleUserMenuAction}>
                <DropdownItem key={USER_MENU_LOGOUT_KEY}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Button
              aria-label="Login with Google"
              as={Link}
              href={getGoogleSignInPath()}
              isIconOnly
              radius="full"
              size="sm"
              variant="bordered"
            >
              <LogIn aria-hidden="true" size={18} />
            </Button>
          )}
        </NavbarItem>

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
