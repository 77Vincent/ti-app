import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { PAGE_PATHS } from "@/lib/config/paths";
import DashboardLayoutClient from "./DashboardLayoutClient";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    redirect(PAGE_PATHS.SIGN_IN);
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
