"use client";

import {
  Avatar,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import dynamic from "next/dynamic";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BRAND_TITLE } from "@/lib/config/brand";
import QuotaBattery from "./QuotaBattery";
import { useAppBarSession } from "./useAppBarSession";
import { PAGE_PATHS } from "@/lib/config/paths";

const ThemeToggleButton = dynamic(
  () =>
    import("./ThemeToggleButton").then(
      (module) => module.ThemeToggleButton,
    ),
  { ssr: false },
);
const LOGO_ALT = `${BRAND_TITLE} Logo`;

export default function AppBar() {
  const { isAuthenticated, plan } = useAppBarSession();
  const SIGN_IN_LABEL = "Sign in";

  const isPro = plan?.isPro === true;
  const showNonProQuota = isAuthenticated
    && plan !== null
    && !plan.isPro
    && plan.dailySubmittedQuota !== null;

  return (
    <Navbar height={52} maxWidth="full" position="sticky">
      <NavbarBrand>
        <Link
          title={BRAND_TITLE}
          className="hover:brightness-125 flex items-center gap-2"
          href={PAGE_PATHS.HOME}
          aria-label={BRAND_TITLE}
        >
          <Image src="/logo.svg" alt={LOGO_ALT} width={44} height={40} />
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
          {isAuthenticated ? (
            <Avatar
              color="primary"
              icon={<User aria-hidden="true" strokeWidth={2.5} size={20} />}
              size="sm"
            />
          ) : (
            <Link
              aria-label={SIGN_IN_LABEL}
              href={PAGE_PATHS.SIGN_IN}
              title={SIGN_IN_LABEL}
            >
              <User className="hover:bg-default-200/80 rounded-full w-7.5 h-7.5 p-1" aria-hidden="true" strokeWidth={2.5} size={20} />
            </Link>
          )}
        </NavbarItem>
        <NavbarItem>
          <ThemeToggleButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
