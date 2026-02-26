import { API_PATHS } from "@/lib/config/paths";

export type UserPlan = {
  isPro: boolean;
  dailySubmittedCount: number;
  dailySubmittedQuota: number | null;
};

export async function readUserPlan(): Promise<UserPlan | null> {
  const response = await fetch(API_PATHS.USER_PLAN, {
    cache: "no-store",
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as UserPlan;
}
