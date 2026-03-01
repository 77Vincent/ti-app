"use client";

import { usePathname } from "next/navigation";
import { PAGE_PATHS } from "@/lib/config/paths";
import AppBar from "./AppBar";

const MOBILE_APP_BAR_VISIBLE_PATHS = new Set<string>([
  PAGE_PATHS.HOME,
  PAGE_PATHS.TEST,
  PAGE_PATHS.SIGN_IN,
  PAGE_PATHS.TERMS_OF_USE,
  PAGE_PATHS.PRIVACY_POLICY,
]);

export default function MobileHomeAppBar() {
  const pathname = usePathname();
  const isVisiblePath = MOBILE_APP_BAR_VISIBLE_PATHS.has(pathname);
  if (!isVisiblePath) {
    return null;
  }

  return (
    <div className="sm:hidden">
      <AppBar />
    </div>
  );
}
