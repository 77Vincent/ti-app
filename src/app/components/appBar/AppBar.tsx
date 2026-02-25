"use client";

import {
  Avatar,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import dynamic from "next/dynamic";
import { User, User2 } from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { API_PATHS, PAGE_PATHS } from "@/lib/config/paths";
import { readUserSettings } from "@/lib/settings/api";
import { useSettingsStore } from "@/lib/settings/store";
import {
  hasAuthenticatedUser,
} from "../../auth/sessionState";
import { clearTestSession } from "../../test/run/questionRunner/session/storage";

const ThemeToggleButton = dynamic(
  () =>
    import("./ThemeToggleButton").then(
      (module) => module.ThemeToggleButton,
    ),
  { ssr: false },
);

async function readUserPlan(): Promise<boolean> {
  const response = await fetch(API_PATHS.USER_PLAN, {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    return false;
  }

  const payload = (await response.json()) as { isPro?: unknown };
  return payload.isPro === true;
}

export default function AppBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const applyUserSettings = useSettingsStore((state) => state.applyUserSettings);
  const SIGN_IN_LABEL = "Sign in";
  const DASHBOARD_LABEL = "Dashboard";

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active) {
        return;
      }

      const authenticated = hasAuthenticatedUser(session);
      setIsAuthenticated(authenticated);
      setUserDisplayName(session?.user?.name?.trim() || session?.user?.email?.trim() || "User");

      if (!authenticated) {
        setIsPro(false);
        return;
      }

      void readUserSettings()
        .then((settings) => {
          if (active) {
            applyUserSettings(settings);
          }
        })
        .catch(() => undefined);

      void readUserPlan()
        .then((planIsPro) => {
          if (active) {
            setIsPro(planIsPro);
          }
        })
        .catch(() => undefined);
    });

    return () => {
      active = false;
    };
  }, [applyUserSettings]);

  function clearSessionThen(action: () => void) {
    void clearTestSession()
      .catch(() => undefined)
      .finally(action);
  }

  function handleSignIn() {
    clearSessionThen(() => {
      window.location.assign(PAGE_PATHS.SIGN_IN);
    });
  }

  return (
    <Navbar shouldHideOnScroll height={52} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Link
          title="Ti"
          className="hover:brightness-125 flex items-center gap-2"
          href={PAGE_PATHS.HOME}
          aria-label="Ti"
        >
          <Image src="/logo.svg" alt="Ti Logo" width={44} height={40} />
          {isAuthenticated && isPro ? "Pro" : null}
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          {isAuthenticated ? (
            <Link
              aria-label={DASHBOARD_LABEL}
              href={PAGE_PATHS.DASHBOARD}
              title={userDisplayName || DASHBOARD_LABEL}
            >
              <Avatar
                color="primary"
                icon={<User aria-hidden="true" size={18} />}
                size="sm"
              />
            </Link>
          ) : (
            <Button
              aria-label={SIGN_IN_LABEL}
              title={SIGN_IN_LABEL}
              isIconOnly
              onPress={handleSignIn}
              radius="full"
              size="sm"
              variant="light"
              startContent={
                <User2 aria-hidden="true" size={20} />
              }
            />
          )}
        </NavbarItem>
        <NavbarItem>
          <ThemeToggleButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
