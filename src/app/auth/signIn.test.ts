import { describe, expect, it } from "vitest";
import { getGoogleSignInPath, getSignInPagePath } from "./signIn";

describe("sign-in paths", () => {
  it("returns sign-in page path", () => {
    expect(getSignInPagePath()).toBe("/signin");
  });

  it("returns the provider sign-in path for Google", () => {
    expect(getGoogleSignInPath()).toBe("/api/auth/signin/google");
  });

  it("appends callbackUrl when provided", () => {
    expect(getGoogleSignInPath("/test")).toBe(
      "/api/auth/signin/google?callbackUrl=%2Ftest",
    );
  });
});
