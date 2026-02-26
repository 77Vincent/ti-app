export const USER_PLAN_REFRESH_EVENT = "user-plan:refresh";

export function notifyUserPlanRefresh(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(USER_PLAN_REFRESH_EVENT));
}
