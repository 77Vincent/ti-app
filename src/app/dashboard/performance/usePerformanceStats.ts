"use client";

import { useEffect, useState } from "react";
import type { StatsPayload } from "@/lib/stats/data";
import { readDashboardPerformanceStats } from "./api";
import {
  buildStatsCacheKey,
  readCachedStats,
  writeCachedStats,
} from "./cache";
import { readPerformanceUserCacheKey } from "./userCacheKey";

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
    const controller = new AbortController();

    void (async () => {
      const userCacheKey = buildStatsCacheKey(
        await readPerformanceUserCacheKey(),
      );
      if (controller.signal.aborted) {
        return;
      }

      const cachedPayload = readCachedStats(userCacheKey);
      if (cachedPayload) {
        setPayload(cachedPayload);
        setIsLoading(false);
      }

      await readDashboardPerformanceStats(controller.signal)
        .then((nextPayload) => {
          if (controller.signal.aborted) {
            return;
          }

          setPayload(nextPayload);
          setLoadError(null);
          writeCachedStats(userCacheKey, nextPayload);
        })
        .catch((error) => {
          if (controller.signal.aborted || cachedPayload) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Failed to load performance.";
          setLoadError(message);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    isLoading,
    loadError,
    payload,
  };
}
