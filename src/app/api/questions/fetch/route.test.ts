import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  parseQuestionParam,
  readQuestionFromPoolById,
  readRandomQuestionFromPool,
  readTestSessionQuestionState,
  updateTestSessionCurrentQuestionId,
} = vi.hoisted(() => ({
  parseQuestionParam: vi.fn(),
  readQuestionFromPoolById: vi.fn(),
  readRandomQuestionFromPool: vi.fn(),
  readTestSessionQuestionState: vi.fn(),
  updateTestSessionCurrentQuestionId: vi.fn(),
}));

vi.mock("@/lib/testSession/validation", () => ({
  parseQuestionParam,
}));

vi.mock("../pool/repo", () => ({
  readQuestionFromPoolById,
  readRandomQuestionFromPool,
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
    readQuestionFromPoolById.mockReset();
    readRandomQuestionFromPool.mockReset();
    readTestSessionQuestionState.mockReset();
    updateTestSessionCurrentQuestionId.mockReset();

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    readQuestionFromPoolById.mockResolvedValue(null);
    readRandomQuestionFromPool.mockResolvedValue(VALID_QUESTION);
    readTestSessionQuestionState.mockResolvedValue(null);
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
  });

  it("returns persisted current question when session has one and next is false", async () => {
    readTestSessionQuestionState.mockResolvedValueOnce({
      id: "session-1",
      currentQuestionId: "question-current",
      recentQuestionResults: [],
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
  });

  it("returns next question and persists it when next is true", async () => {
    readTestSessionQuestionState.mockResolvedValueOnce({
      id: "session-1",
      currentQuestionId: "question-current",
      recentQuestionResults: [
        { questionId: "question-a", isCorrect: true },
        { questionId: "question-b", isCorrect: false },
      ],
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
    expect(readRandomQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT, {
      excludeQuestionIds: ["question-a", "question-b", "question-current"],
    });
    expect(updateTestSessionCurrentQuestionId).toHaveBeenCalledWith(
      "session-1",
      VALID_QUESTION.id,
    );
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
