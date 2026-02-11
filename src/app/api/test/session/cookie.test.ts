import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";

const { cookieGet, cookiesFn } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookiesFn: vi.fn(async () => ({
    get: cookieGet,
  })),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesFn,
}));

import {
  persistAnonymousIdCookie,
  readAnonymousIdCookie,
  readSessionTokenCookieValues,
} from "./cookie";

describe("test session cookie helpers", () => {
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

  it("reads and trims anonymous id cookie", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      if (cookieName !== "ti-app-anon-id") {
        return undefined;
      }

      return { value: "  anon-id-1  " };
    });

    await expect(readAnonymousIdCookie()).resolves.toBe("anon-id-1");
  });

  it("returns null for blank anonymous id cookie", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      if (cookieName !== "ti-app-anon-id") {
        return undefined;
      }

      return { value: "   " };
    });

    await expect(readAnonymousIdCookie()).resolves.toBeNull();
  });

  it("persists anonymous id cookie when requested", () => {
    const set = vi.fn();
    const response = { cookies: { set } };

    const result = persistAnonymousIdCookie(
      response as unknown as NextResponse,
      "anon-id-1",
      true,
    );

    expect(result).toBe(response);
    expect(set).toHaveBeenCalledWith("ti-app-anon-id", "anon-id-1", {
      httpOnly: true,
      maxAge: 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  it("does not persist anonymous id cookie when not requested", () => {
    const set = vi.fn();
    const response = { cookies: { set } };

    persistAnonymousIdCookie(
      response as unknown as NextResponse,
      "anon-id-1",
      false,
    );
    persistAnonymousIdCookie(response as unknown as NextResponse, null, true);

    expect(set).not.toHaveBeenCalled();
  });
});
