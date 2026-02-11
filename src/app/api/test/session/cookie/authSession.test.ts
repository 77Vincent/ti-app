import { beforeEach, describe, expect, it, vi } from "vitest";

const { cookieGet, cookiesFn } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookiesFn: vi.fn(async () => ({
    get: cookieGet,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesFn,
}));

import { readSessionTokenCookieValues } from "./authSession";

describe("auth cookie helpers", () => {
  beforeEach(() => {
    cookieGet.mockReset();
    cookiesFn.mockClear();
  });

  it("reads available auth session token cookie values", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      const values: Record<string, string | undefined> = {
        "__Secure-next-auth.session-token": "session-token-b",
        "next-auth.session-token": "session-token-a",
      };

      const value = values[cookieName];
      if (value === undefined) {
        return undefined;
      }

      return { value };
    });

    await expect(readSessionTokenCookieValues()).resolves.toEqual([
      "session-token-a",
      "session-token-b",
    ]);
  });
});
