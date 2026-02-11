import { describe, expect, it } from "vitest";
import { getGoogleSignInPath } from "./googleSignIn";

describe("google sign-in path", () => {
  it("returns the provider sign-in path for Google", () => {
    expect(getGoogleSignInPath()).toBe("/api/auth/signin/google");
  });
});
