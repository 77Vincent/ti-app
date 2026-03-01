"use client";

import { useEffect, useState } from "react";
import type { StatsPayload } from "@/lib/stats/data";
import { readDashboardPerformanceStats } from "./api";

type UsePerformanceStatsResult = {
  isLoading: boolean;
  loadError: string | null;
  payload: StatsPayload | null;
};

export function usePerformanceStats(): UsePerformanceStatsResult {
  const [payload, setPayload] = useState<StatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void readDashboardPerformanceStats()
      .then((nextPayload) => {
        if (!active) {
          return;
        }

        setPayload(nextPayload);
        setLoadError(null);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load performance.";
        setLoadError(message);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    isLoading,
    loadError,
    payload,
  };
}
