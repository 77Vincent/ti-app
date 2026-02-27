import { describe, expect, it } from "vitest";
import { API_PATHS, COOKIE_PATHS, PAGE_PATHS } from "./paths";

describe("PAGE_PATHS", () => {
  it("exports stable page routes", () => {
    expect(PAGE_PATHS).toEqual({
      HOME: "/",
      TEST: "/test",
      DASHBOARD: "/dashboard",
      DASHBOARD_FAVORITES: "/dashboard/favorites",
      DASHBOARD_PERFORMANCE: "/dashboard/performance",
      DASHBOARD_ACCOUNT: "/dashboard/account",
      DASHBOARD_SETTINGS: "/dashboard/settings",
      SIGN_IN: "/signin",
      TEST_RUN: "/run",
      TERMS_OF_USE: "/terms-of-use",
      PRIVACY_POLICY: "/privacy-policy",
    });
  });
});

describe("API_PATHS", () => {
  it("exports stable API routes", () => {
    expect(API_PATHS).toEqual({
      QUESTIONS_FAVORITE: "/api/questions/favorite",
      QUESTIONS_FETCH: "/api/questions/fetch",
      TEST_SESSION: "/api/test/session",
      TEST_SESSION_DIFFICULTY: "/api/test/session/difficulty",
      USER_SETTINGS: "/api/user/settings",
      USER_PLAN: "/api/user/plan",
    });
  });
});

describe("COOKIE_PATHS", () => {
  it("exports root cookie path", () => {
    expect(COOKIE_PATHS).toEqual({
      ROOT: "/",
    });
  });
});
