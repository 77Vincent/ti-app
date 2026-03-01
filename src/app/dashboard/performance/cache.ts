import type { StatsPayload } from "@/lib/stats/data";

const STATS_CACHE_KEY_PREFIX = "dashboard.performance.stats";

export function buildStatsCacheKey(userKey: string): string {
  return `${STATS_CACHE_KEY_PREFIX}:${userKey}`;
}

export function readCachedStats(cacheKey: string): StatsPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(cacheKey);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StatsPayload;
  } catch {
    return null;
  }
}

export function writeCachedStats(
  cacheKey: string,
  payload: StatsPayload,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(cacheKey, JSON.stringify(payload));
}
