"use client";

import { Avatar, Link } from "@heroui/react";
import {
  BarChart3,
  Heart,
  LayoutDashboard,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { PAGE_PATHS } from "@/lib/config/paths";

type DashboardLayoutClientProps = {
  children: ReactNode;
};

const DASHBOARD_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: PAGE_PATHS.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Performance",
    href: PAGE_PATHS.DASHBOARD_PERFORMANCE,
    icon: BarChart3,
  },
  {
    label: "Favorites",
    href: PAGE_PATHS.DASHBOARD_FAVORITES,
    icon: Heart,
  },
  {
    label: "Settings",
    href: PAGE_PATHS.DASHBOARD_SETTINGS,
    icon: SettingsIcon,
  },
  {
    label: "Account",
    href: PAGE_PATHS.DASHBOARD_ACCOUNT,
    icon: User,
  },
] as const;

export default function DashboardLayoutClient({
  children,
}: DashboardLayoutClientProps) {
  const MOBILE_NAV_SAFE_BOTTOM = "max(env(safe-area-inset-bottom, 0px), 0.5rem)";
  const pathname = usePathname();
  const [avatarImage, setAvatarImage] = useState<string | undefined>(undefined);
  const [avatarName, setAvatarName] = useState("");

  useEffect(() => {
    let active = true;

    void getSession().then((session) => {
      if (!active) {
        return;
      }

      const image = session?.user?.image?.trim();
      setAvatarImage(image && image.length > 0 ? image : undefined);
      setAvatarName(session?.user?.name?.trim() || session?.user?.email?.trim() || "User");
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-4 pb-20 md:flex-row md:pb-0">
      <aside className="w-full md:flex md:min-h-64 md:w-40 lg:w-56 md:shrink-0">
        <nav aria-label="Dashboard sections" className="w-full">
          <ul
            className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-divider bg-background/85 px-2 py-2 backdrop-blur-md md:hidden"
            style={{ paddingBottom: MOBILE_NAV_SAFE_BOTTOM }}
          >
            {DASHBOARD_NAV_ITEMS.map((item) => (
              <li key={item.href} className="flex-1">
                <Link
                  as={NextLink}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  color="foreground"
                  underline={pathname === item.href ? "always" : "none"}
                  className="inline-flex h-9 w-full items-center justify-center"
                >
                  <item.icon aria-hidden size={20} strokeWidth={2.5} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden h-full flex-col md:flex">
            <ul className="flex flex-col gap-3">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    as={NextLink}
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    color="foreground"
                    underline={pathname === item.href ? "always" : "none"}
                    isBlock
                    className="w-full"
                  >
                    <span className="inline-flex items-center gap-2">
                      <item.icon aria-hidden size={18} />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-3">
              <div className="inline-flex items-center gap-2">
                <Avatar
                  color="primary"
                  icon={<User aria-hidden strokeWidth={2.5} size={18} />}
                  name={avatarName}
                  size="sm"
                  src={avatarImage}
                />
                <span>{avatarName}</span>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      <div className="min-h-64 flex-1">{children}</div>
    </section>
  );
}
