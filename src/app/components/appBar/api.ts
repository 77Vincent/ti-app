import { API_PATHS } from "@/lib/config/paths";

type UserPlanResponse = {
  isPro?: unknown;
};

function parseUserPlanResponse(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  return (payload as UserPlanResponse).isPro === true;
}

export async function readUserPlan(): Promise<boolean> {
  const response = await fetch(API_PATHS.USER_PLAN, {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    return false;
  }

  return parseUserPlanResponse((await response.json()) as unknown);
}
