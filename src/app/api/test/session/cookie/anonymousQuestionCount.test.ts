import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";
import { ANONYMOUS_SESSION_TTL } from "@/lib/config/testPolicy";
import { COOKIE_PATHS } from "@/lib/config/paths";

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
  incrementAnonymousQuestionCountCookie,
  readAnonymousQuestionCount,
} from "./anonymousQuestionCount";

describe("anonymous question count cookie helpers", () => {
  beforeEach(() => {
    cookieGet.mockReset();
    cookiesFn.mockClear();
  });

  it("reads 0 when cookie is missing", async () => {
    cookieGet.mockReturnValueOnce(undefined);

    await expect(readAnonymousQuestionCount()).resolves.toBe(0);
  });

  it("reads the parsed cookie value", async () => {
    cookieGet.mockReturnValueOnce({ value: "3" });

    await expect(readAnonymousQuestionCount()).resolves.toBe(3);
  });

  it("reads 0 when cookie value is invalid", async () => {
    cookieGet.mockReturnValueOnce({ value: "invalid-value" });

    await expect(readAnonymousQuestionCount()).resolves.toBe(0);
  });

  it("increments anonymous question count cookie", () => {
    const set = vi.fn();
    const response = { cookies: { set } };

    const result = incrementAnonymousQuestionCountCookie(
      response as unknown as NextResponse,
      2,
    );

    expect(result).toBe(response);
    expect(set).toHaveBeenCalledWith(
      "ti-app-anon-question-count",
      "3",
      {
        httpOnly: true,
        maxAge: ANONYMOUS_SESSION_TTL,
        path: COOKIE_PATHS.ROOT,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );
  });
});
