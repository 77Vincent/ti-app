"use client";

import { Divider, Link } from "@heroui/react";
import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { PAGE_PATHS } from "@/lib/config/paths";

type DashboardLayoutProps = {
  children: ReactNode;
};

const DASHBOARD_NAV_ITEMS = [
  {
    label: "Overview",
    href: PAGE_PATHS.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Tests",
    href: PAGE_PATHS.DASHBOARD_TESTS,
    icon: ClipboardCheck,
  },
  {
    label: "Settings",
    href: PAGE_PATHS.DASHBOARD_SETTINGS,
    icon: SettingsIcon,
  },
] as const;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  function handleLogout() {
    void signOut({
      callbackUrl: PAGE_PATHS.SIGN_IN,
    });
  }

  const pageTitle =
    DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname)?.label ??
    "Dashboard";

  return (
    <section className="flex flex-1 gap-4">
      <aside className="flex min-h-64 w-56 shrink-0 p-2">
        <nav aria-label="Dashboard sections" className="flex w-full flex-col">
          <ul className="flex flex-col gap-3">
            {DASHBOARD_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link as={NextLink} href={item.href} color="foreground" isBlock className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <item.icon aria-hidden size={18} />
                    <span>{item.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-3">
            <Link as="button" onPress={handleLogout} color="foreground" isBlock className="w-full">
              <span className="inline-flex items-center cursor-pointer gap-2">
                <LogOut aria-hidden size={18} />
                <span>Logout</span>
              </span>
            </Link>
          </div>
        </nav>
      </aside>


      <div className="flex min-h-64 flex-1 flex-col gap-4 p-4">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
        <Divider />
        {children}
      </div>
    </section>
  );
}
