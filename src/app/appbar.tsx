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
import { Settings, User, User2 } from "lucide-react";
import { getSession, signOut } from "next-auth/react";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const SETTINGS_LABEL = "Settings";
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
                variant="light"
              >
                <User2 aria-hidden="true" size={20} />
              </Button>
            </Tooltip>
          )}
        </NavbarItem>

        <NavbarItem>
          <Tooltip content={SETTINGS_LABEL}>
            <Button
              aria-label={SETTINGS_LABEL}
              isIconOnly
              radius="full"
              size="sm"
              variant="light"
            >
              <Settings aria-hidden="true" size={20} />
            </Button>
          </Tooltip>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
