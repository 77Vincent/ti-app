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
import { LoaderCircle, User, User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import QuotaBattery from "./QuotaBattery";
import { useAppBarSession } from "./useAppBarSession";
import { useSignInNavigation } from "./useSignInNavigation";
import { PAGE_PATHS } from "@/lib/config/paths";

const ThemeToggleButton = dynamic(
  () =>
    import("./ThemeToggleButton").then(
      (module) => module.ThemeToggleButton,
    ),
  { ssr: false },
);

export default function AppBar() {
  const { isAuthLoading, isAuthenticated, plan, userDisplayName } = useAppBarSession();
  const handleSignIn = useSignInNavigation();
  const SIGN_IN_LABEL = "Sign in";
  const DASHBOARD_LABEL = "Dashboard";

  const isPro = plan?.isPro === true;
  const showNonProQuota = isAuthenticated
    && plan !== null
    && !plan.isPro
    && plan.dailySubmittedQuota !== null;

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
        {showNonProQuota ? (
          <NavbarItem>
            <Link
              aria-label="Open account to upgrade to Pro"
              className="hover:opacity-80 transition-opacity"
              href={PAGE_PATHS.DASHBOARD_ACCOUNT}
              title="Open account to upgrade to Pro"
            >
              <QuotaBattery
                used={plan.dailySubmittedCount}
                quota={plan.dailySubmittedQuota!}
              />
            </Link>
          </NavbarItem>
        ) : null}
        <NavbarItem>
          {isAuthLoading ? (
            <Avatar
              color="primary"
              icon={<LoaderCircle aria-hidden="true" className="animate-spin" strokeWidth={2.5} size={18} />}
              size="sm"
            />
          ) : isAuthenticated ? (
            <Link
              aria-label={DASHBOARD_LABEL}
              href={PAGE_PATHS.DASHBOARD}
              title={userDisplayName || DASHBOARD_LABEL}
            >
              <Avatar
                color="primary"
                icon={<User aria-hidden="true" strokeWidth={2.5} size={18} />}
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
                <User2 aria-hidden="true" strokeWidth={2.5} size={20} />
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
