import { describe, expect, it } from "vitest";
import { hasAuthenticatedUser } from "./sessionState";

describe("session state", () => {
  it("returns true when session has a user", () => {
    expect(
      hasAuthenticatedUser({
        expires: new Date().toISOString(),
        user: { email: "a@example.com" },
      }),
    ).toBe(true);
  });

  it("returns false when session is null", () => {
    expect(hasAuthenticatedUser(null)).toBe(false);
  });

  it("returns false when session user is missing", () => {
    expect(hasAuthenticatedUser({ expires: new Date().toISOString() })).toBe(
      false,
    );
  });
});
