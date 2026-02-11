import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";
import { ANONYMOUS_SESSION_TTL } from "@/lib/config/testPolicy";

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
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
} from "./anonymous";

describe("anonymous session cookie helpers", () => {
  beforeEach(() => {
    cookieGet.mockReset();
    cookiesFn.mockClear();
  });

  it("reads anonymous test session cookie when payload is valid", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      if (cookieName !== "ti-app-anon-test-session") {
        return undefined;
      }

      return {
        value: encodeURIComponent(
          JSON.stringify({
            difficulty: "beginner",
            subjectId: "language",
            subcategoryId: "english",
          }),
        ),
      };
    });

    await expect(readAnonymousTestSessionCookie()).resolves.toEqual({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("returns null when anonymous test session cookie is malformed", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      if (cookieName !== "ti-app-anon-test-session") {
        return undefined;
      }

      return {
        value: "not-json",
      };
    });

    await expect(readAnonymousTestSessionCookie()).resolves.toBeNull();
  });

  it("persists anonymous test session cookie", () => {
    const set = vi.fn();
    const response = { cookies: { set } };

    const result = persistAnonymousTestSessionCookie(
      response as unknown as NextResponse,
      {
        difficulty: "beginner",
        subjectId: "language",
        subcategoryId: "english",
      },
    );

    expect(result).toBe(response);
    expect(set).toHaveBeenCalledWith(
      "ti-app-anon-test-session",
      encodeURIComponent(
        JSON.stringify({
          difficulty: "beginner",
          subjectId: "language",
          subcategoryId: "english",
        }),
      ),
      {
        httpOnly: true,
        maxAge: ANONYMOUS_SESSION_TTL,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );
  });

  it("clears anonymous test session cookie", () => {
    const del = vi.fn();
    const response = { cookies: { delete: del } };

    const result = clearAnonymousTestSessionCookie(
      response as unknown as NextResponse,
    );

    expect(result).toBe(response);
    expect(del).toHaveBeenCalledWith({
      name: "ti-app-anon-test-session",
      path: "/",
    });
  });
});
