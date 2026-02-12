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
import { PAGE_PATHS } from "@/lib/config/paths";
import {
  hasAuthenticatedUser,
  USER_MENU_LOGOUT_KEY,
} from "./auth/sessionState";
import { clearTestSession } from "./test/run/questionRunner/session";

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

  function clearSessionThen(action: () => void) {
    void clearTestSession()
      .catch(() => undefined)
      .finally(action);
  }

  function handleUserMenuAction(key: Key) {
    if (key === USER_MENU_LOGOUT_KEY) {
      clearSessionThen(() => {
        void signOut({
          callbackUrl: PAGE_PATHS.TEST,
        });
      });
    }
  }

  function handleSignIn() {
    clearSessionThen(() => {
      window.location.assign(PAGE_PATHS.SIGN_IN);
    });
  }

  return (
    <Navbar height={55} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Link className="hover:brightness-125 flex gap-2" href={PAGE_PATHS.HOME} aria-label="Ti">
          <Image src="/logo.svg" alt="Ti Logo" width={44} height={40} />
          <span className="text-2xl font-semibold">Ti</span>
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
                isIconOnly
                onPress={handleSignIn}
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
