import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";

const {
  incrementAnonymousQuestionCountCookie,
  readAnonymousQuestionCount,
  readAuthenticatedUserId,
} = vi.hoisted(() => ({
  incrementAnonymousQuestionCountCookie: vi.fn((response: Response) => response),
  readAnonymousQuestionCount: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
}));

vi.mock("./auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./cookie/anonymousQuestionCount", () => ({
  incrementAnonymousQuestionCountCookie,
  readAnonymousQuestionCount,
}));

import { PATCH } from "./route";

describe("test session route PATCH", () => {
  beforeEach(() => {
    incrementAnonymousQuestionCountCookie.mockReset();
    readAnonymousQuestionCount.mockReset();
    readAuthenticatedUserId.mockReset();

    incrementAnonymousQuestionCountCookie.mockImplementation(
      (response: Response) => response,
    );
    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousQuestionCount.mockResolvedValue(0);
  });

  it("does not apply anonymous limit for authenticated users", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await PATCH();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(readAnonymousQuestionCount).not.toHaveBeenCalled();
    expect(incrementAnonymousQuestionCountCookie).not.toHaveBeenCalled();
  });

  it("increments anonymous question count below limit", async () => {
    readAnonymousQuestionCount.mockResolvedValue(2);

    const response = await PATCH();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(incrementAnonymousQuestionCountCookie).toHaveBeenCalledWith(
      expect.any(Response),
      2,
    );
  });

  it("blocks anonymous question fetch at configured limit", async () => {
    readAnonymousQuestionCount.mockResolvedValue(MAX_ANONYMOUS_QUESTION_COUNT);

    const response = await PATCH();

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: `You have reached the anonymous limit of ${MAX_ANONYMOUS_QUESTION_COUNT} questions. Please log in to continue.`,
    });
    expect(incrementAnonymousQuestionCountCookie).not.toHaveBeenCalled();
  });
});
