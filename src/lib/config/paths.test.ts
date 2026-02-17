import { describe, expect, it } from "vitest";
import { API_PATHS, COOKIE_PATHS, PAGE_PATHS } from "./paths";

describe("PAGE_PATHS", () => {
  it("exports stable page routes", () => {
    expect(PAGE_PATHS).toEqual({
      HOME: "/",
      SIGN_IN: "/signin",
      TEST: "/test",
      TEST_RUN: "/test/run",
    });
  });
});

describe("API_PATHS", () => {
  it("exports stable API routes", () => {
    expect(API_PATHS).toEqual({
      QUESTIONS_FAVORITE: "/api/questions/favorite",
      QUESTIONS_FETCH: "/api/questions/fetch",
      TEST_SESSION: "/api/test/session",
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
