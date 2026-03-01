import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { StatsPayload } from "@/lib/stats/data";

export async function readDashboardPerformanceStats(
  signal?: AbortSignal,
): Promise<StatsPayload> {
  const response = await fetch(API_PATHS.DASHBOARD_PERFORMANCE, {
    cache: "no-store",
    method: "GET",
    signal,
  });
  if (!response.ok) {
    throw new Error(
      await parseHttpErrorMessage(response, "Failed to load performance."),
    );
  }

  return (await response.json()) as StatsPayload;
}
