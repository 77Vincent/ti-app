export const PAGE_PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  DASHBOARD_ACCOUNT: "/dashboard/account",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  SIGN_IN: "/signin",
  TEST_RUN: "/test/run",
} as const;

export const API_PATHS = {
  QUESTIONS_FAVORITE: "/api/questions/favorite",
  QUESTIONS_FETCH: "/api/questions/fetch",
  TEST_SESSION: "/api/test/session",
  USER_SETTINGS: "/api/user/settings",
} as const;

export const COOKIE_PATHS = {
  ROOT: "/",
} as const;
