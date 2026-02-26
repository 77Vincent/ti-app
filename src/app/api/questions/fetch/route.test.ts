import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT } from "@/lib/config/testPolicy";

const {
  isUserPro,
  parseQuestionParam,
  readQuestionFromPoolById,
  readAuthenticatedUserId,
  readRandomQuestionFromPool,
  readUserDailySubmittedCount,
  readTestSessionQuestionState,
  shuffleQuestionOptions,
  updateTestSessionCurrentQuestionId,
} = vi.hoisted(() => ({
  isUserPro: vi.fn(),
  parseQuestionParam: vi.fn(),
  readQuestionFromPoolById: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  readRandomQuestionFromPool: vi.fn(),
  readUserDailySubmittedCount: vi.fn(),
  readTestSessionQuestionState: vi.fn(),
  shuffleQuestionOptions: vi.fn(),
  updateTestSessionCurrentQuestionId: vi.fn(),
}));

vi.mock("@/lib/testSession/validation", () => ({
  parseQuestionParam,
}));

vi.mock("../pool/repo", () => ({
  readQuestionFromPoolById,
  readRandomQuestionFromPool,
}));

vi.mock("@/lib/question/shuffle", () => ({
  shuffleQuestionOptions,
}));

vi.mock("@/lib/billing/pro", () => ({
  isUserPro,
}));

vi.mock("../../test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("../../test/session/repo/user", () => ({
  readUserDailySubmittedCount,
}));

vi.mock("../../test/session/repo/testSession", () => ({
  readTestSessionQuestionState,
  updateTestSessionCurrentQuestionId,
}));

const VALID_INPUT = {
  difficulty: "A1",
  subjectId: "language",
  subcategoryId: "english",
};

const VALID_QUESTION = {
  id: "question-1",
  prompt: "What is the capital of France?",
  difficulty: "A1",
  options: [
    { text: "Paris", explanation: "Correct." },
    { text: "Berlin", explanation: "Incorrect." },
    { text: "Madrid", explanation: "Incorrect." },
    { text: "Rome", explanation: "Incorrect." },
  ],
  correctOptionIndexes: [0],
} as const;

describe("fetch question route", () => {
  beforeEach(() => {
    vi.resetModules();
    parseQuestionParam.mockReset();
    isUserPro.mockReset();
    readQuestionFromPoolById.mockReset();
    readAuthenticatedUserId.mockReset();
    readRandomQuestionFromPool.mockReset();
    readUserDailySubmittedCount.mockReset();
    readTestSessionQuestionState.mockReset();
    shuffleQuestionOptions.mockReset();
    updateTestSessionCurrentQuestionId.mockReset();

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    isUserPro.mockResolvedValue(true);
    readQuestionFromPoolById.mockResolvedValue(null);
    readAuthenticatedUserId.mockResolvedValue(null);
    readRandomQuestionFromPool.mockResolvedValue(VALID_QUESTION);
    readUserDailySubmittedCount.mockResolvedValue(0);
    readTestSessionQuestionState.mockResolvedValue(null);
    shuffleQuestionOptions.mockImplementation((question) => question);
    updateTestSessionCurrentQuestionId.mockResolvedValue(undefined);
  });

  it("returns a random pooled question", async () => {
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(readRandomQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(shuffleQuestionOptions).toHaveBeenCalledWith(
      VALID_QUESTION,
      VALID_QUESTION.id,
    );
  });

  it("returns persisted current question when session has one and next is false", async () => {
    readTestSessionQuestionState.mockResolvedValueOnce({
      id: "session-1",
      currentQuestionId: "question-current",
    });
    readQuestionFromPoolById.mockResolvedValueOnce(VALID_QUESTION);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify({
          ...VALID_INPUT,
          sessionId: "session-1",
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(readQuestionFromPoolById).toHaveBeenCalledWith(
      VALID_INPUT,
      "question-current",
    );
    expect(readRandomQuestionFromPool).not.toHaveBeenCalled();
    expect(updateTestSessionCurrentQuestionId).not.toHaveBeenCalled();
    expect(shuffleQuestionOptions).toHaveBeenCalledWith(
      VALID_QUESTION,
      "session-1:question-1",
    );
  });

  it("returns next question and persists it when next is true", async () => {
    readTestSessionQuestionState.mockResolvedValueOnce({
      id: "session-1",
      currentQuestionId: "question-current",
    });
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify({
          ...VALID_INPUT,
          sessionId: "session-1",
          next: true,
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(readRandomQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(updateTestSessionCurrentQuestionId).toHaveBeenCalledWith(
      "session-1",
      VALID_QUESTION.id,
    );
    expect(shuffleQuestionOptions).toHaveBeenCalledWith(
      VALID_QUESTION,
      "session-1:question-1",
    );
  });

  it("returns 429 when authenticated non-pro reaches daily cap and requests next question", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(false);
    readUserDailySubmittedCount.mockResolvedValueOnce(
      MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
    );
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify({
          ...VALID_INPUT,
          sessionId: "session-1",
          next: true,
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: `You have reached the free plan daily limit of ${MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT} submitted questions. Upgrade to Pro for unlimited questions.`,
    });
    expect(readUserDailySubmittedCount).toHaveBeenCalledWith("user-1");
    expect(isUserPro).toHaveBeenCalledWith("user-1");
    expect(readRandomQuestionFromPool).not.toHaveBeenCalled();
    expect(updateTestSessionCurrentQuestionId).not.toHaveBeenCalled();
  });

  it("returns 429 when authenticated non-pro reaches daily cap on initial question load", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(false);
    readUserDailySubmittedCount.mockResolvedValueOnce(
      MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
    );
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify({
          ...VALID_INPUT,
          sessionId: "session-1",
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: `You have reached the free plan daily limit of ${MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT} submitted questions. Upgrade to Pro for unlimited questions.`,
    });
    expect(readTestSessionQuestionState).not.toHaveBeenCalled();
    expect(readQuestionFromPoolById).not.toHaveBeenCalled();
    expect(readRandomQuestionFromPool).not.toHaveBeenCalled();
    expect(updateTestSessionCurrentQuestionId).not.toHaveBeenCalled();
  });

  it("reads daily count for authenticated pro users and still returns next question", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(true);
    readUserDailySubmittedCount.mockResolvedValueOnce(
      MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
    );
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify({
          ...VALID_INPUT,
          sessionId: "session-1",
          next: true,
        }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(readUserDailySubmittedCount).toHaveBeenCalledWith("user-1");
    expect(isUserPro).toHaveBeenCalledWith("user-1");
    expect(readRandomQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("returns 404 when no pooled question exists", async () => {
    readRandomQuestionFromPool.mockResolvedValueOnce(null);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "No question found for this context.",
    });
  });

  it("returns 400 for invalid request payload", async () => {
    parseQuestionParam.mockReturnValueOnce(null);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, and difficulty are required.",
    });
    expect(readRandomQuestionFromPool).not.toHaveBeenCalled();
  });

  it("returns 500 when pool read throws", async () => {
    readRandomQuestionFromPool.mockRejectedValueOnce(new Error("db down"));
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "db down",
    });
  });

  it("returns 400 when request body is not valid JSON", async () => {
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/fetch", {
        body: "not-json",
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON body.",
    });
    expect(parseQuestionParam).not.toHaveBeenCalled();
    expect(readRandomQuestionFromPool).not.toHaveBeenCalled();
  });
});
