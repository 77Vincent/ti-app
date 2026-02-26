"use client";

import { isDatabaseUnavailableError } from "@/lib/prismaError";
import OfflineFallback from "./OfflineFallback";

type DashboardErrorProps = {
  error: Error;
};

export default function DashboardError({
  error,
}: DashboardErrorProps) {
  if (isDatabaseUnavailableError(error)) {
    return <OfflineFallback />;
  }

  return <p>something went wrong</p>;
}
