import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextResponse } from "next/server";
import {
  ANONYMOUS_SESSION_TTL,
  MAX_ANONYMOUS_QUESTION_COUNT,
} from "@/lib/config/testPolicy";

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
} from "./anonymousCount";

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
      MAX_ANONYMOUS_QUESTION_COUNT - 1,
    );

    expect(result).toBe(response);
    expect(set).toHaveBeenCalledWith(
      "ti-app-anon-question-count",
      String(MAX_ANONYMOUS_QUESTION_COUNT),
      {
        httpOnly: true,
        maxAge: ANONYMOUS_SESSION_TTL,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    );
  });
});
