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
  Tooltip,
} from "@heroui/react";
import { Moon, Sun, User, User2 } from "lucide-react";
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
import { clearStoredTestSession } from "./test/run/questionRunner/session";


export default function AppBar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isDark = resolvedTheme === "dark";
  const THEME_TOGGLE_LABEL = isDark ? "Light theme" : "Dark theme";
  const USER_SESSION_LABEL = isAuthenticated ? "User menu" : "Sign in";

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
      clearStoredTestSession();
      void signOut({
        callbackUrl: "/test",
      });
    }
  }

  return (
    <Navbar height={55} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Link className="hover:brightness-125" href="/" aria-label="Ti">
          <Image src="/logo.svg" alt="Ti Logo" width={48} height={40} />
        </Link>
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
            <Tooltip content={USER_SESSION_LABEL}>
              <Button
                aria-label={USER_SESSION_LABEL}
                as={Link}
                href={getGoogleSignInPath()}
                isIconOnly
                onPress={clearStoredTestSession}
                radius="full"
                size="sm"
                variant="bordered"
              >
                <User2 aria-hidden="true" size={18} />
              </Button>
            </Tooltip>
          )}
        </NavbarItem>

        <NavbarItem>
          <Tooltip content={THEME_TOGGLE_LABEL}>
            <Button
              aria-label={THEME_TOGGLE_LABEL}
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
          </Tooltip>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
