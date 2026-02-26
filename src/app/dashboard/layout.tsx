import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { PAGE_PATHS } from "@/lib/config/paths";
import { isDatabaseUnavailableError } from "@/lib/prismaError";
import DashboardLayoutClient from "./DashboardLayoutClient";
import OfflineFallback from "./OfflineFallback";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  let userId: string | null = null;
  try {
    userId = await readAuthenticatedUserId();
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      return <OfflineFallback />;
    }

    throw error;
  }

  if (!userId) {
    redirect(PAGE_PATHS.SIGN_IN);
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
