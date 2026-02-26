"use client";

import { Divider, Link } from "@heroui/react";
import NextLink from "next/link";
import { PAGE_PATHS } from "@/lib/config/paths";

export default function Footer() {
  return (
    <footer>
      <div className="flex w-full items-center justify-center gap-4 text-sm opacity-70">
        <p>&copy; {new Date().getFullYear()} Ti</p>
        <Divider orientation="vertical" className="h-3" />
        <nav aria-label="Legal" className="flex items-center gap-4">
          <Link
            size="sm"
            as={NextLink}
            color="foreground"
            href={PAGE_PATHS.TERMS_OF_USE}
          >
            Terms of Use
          </Link>
          <Divider orientation="vertical" className="h-3" />
          <Link
            size="sm"
            as={NextLink}
            color="foreground"
            href={PAGE_PATHS.PRIVACY_POLICY}
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
