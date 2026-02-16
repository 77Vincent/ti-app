import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  consumeQuestionFromTestSessionPool,
  generateMockQuestion,
  generateQuestionWithAI,
  parseQuestionParam,
  readAnonymousTestSessionCookie,
  readAuthenticatedUserId,
  readTestSession,
  upsertTestSessionQuestionPoolLink,
  upsertQuestionPool,
} = vi.hoisted(() => ({
  consumeQuestionFromTestSessionPool: vi.fn(),
  generateMockQuestion: vi.fn(),
  generateQuestionWithAI: vi.fn(),
  parseQuestionParam: vi.fn(),
  readAnonymousTestSessionCookie: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  readTestSession: vi.fn(),
  upsertTestSessionQuestionPoolLink: vi.fn(),
  upsertQuestionPool: vi.fn(),
}));

vi.mock("@/lib/testSession/validation", () => ({
  parseQuestionParam,
}));

vi.mock("@/lib/question/ai", () => ({
  generateQuestionWithAI,
}));

vi.mock("./mock", () => ({
  generateMockQuestion,
}));

vi.mock("../pool/repo", () => ({
  consumeQuestionFromTestSessionPool,
  upsertTestSessionQuestionPoolLink,
  upsertQuestionPool,
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("@/app/api/test/session/cookie/anonymous", () => ({
  readAnonymousTestSessionCookie,
}));

vi.mock("@/app/api/test/session/repo/testSession", () => ({
  readTestSession,
}));

const VALID_INPUT = {
  difficulty: "beginner",
  subjectId: "language",
  subcategoryId: "english",
};
const ORIGINAL_OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const VALID_QUESTION = {
  id: "question-1",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  options: [
    { id: "A", text: "Paris", explanation: "Correct." },
    { id: "B", text: "Berlin", explanation: "Incorrect." },
    { id: "C", text: "Madrid", explanation: "Incorrect." },
  ],
  correctOptionIds: ["A"],
} as const;

const VALID_NEXT_QUESTION = {
  id: "question-2",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "Which city is the capital of Japan?",
  options: [
    { id: "A", text: "Kyoto", explanation: "Incorrect." },
    { id: "B", text: "Tokyo", explanation: "Correct." },
    { id: "C", text: "Osaka", explanation: "Incorrect." },
  ],
  correctOptionIds: ["B"],
} as const;

function mockTwoGeneratedQuestions() {
  generateQuestionWithAI.mockResolvedValueOnce([
    VALID_QUESTION,
    VALID_NEXT_QUESTION,
  ]);
}

describe("generate question route", () => {
  beforeEach(() => {
    vi.resetModules();
    consumeQuestionFromTestSessionPool.mockReset();
    generateMockQuestion.mockReset();
    generateQuestionWithAI.mockReset();
    parseQuestionParam.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    readTestSession.mockReset();
    upsertTestSessionQuestionPoolLink.mockReset();
    upsertQuestionPool.mockReset();
    process.env.OPENAI_API_KEY = "test-key";

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSession.mockResolvedValue({
      id: "session-1",
      correctCount: 0,
      difficulty: "beginner",
      goal: "study",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
    });
    consumeQuestionFromTestSessionPool.mockResolvedValue(null);
    generateQuestionWithAI.mockResolvedValue([
      VALID_QUESTION,
      VALID_NEXT_QUESTION,
    ]);
    generateMockQuestion.mockReturnValue(VALID_QUESTION);
    upsertTestSessionQuestionPoolLink.mockResolvedValue(undefined);
    upsertQuestionPool.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (typeof ORIGINAL_OPENAI_API_KEY === "string") {
      process.env.OPENAI_API_KEY = ORIGINAL_OPENAI_API_KEY;
      return;
    }

    delete process.env.OPENAI_API_KEY;
  });

  it("returns test-session pooled questions first", async () => {
    consumeQuestionFromTestSessionPool.mockResolvedValueOnce(VALID_QUESTION);
    generateQuestionWithAI.mockResolvedValueOnce([
      VALID_NEXT_QUESTION,
      VALID_QUESTION,
    ]);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(consumeQuestionFromTestSessionPool).toHaveBeenCalledWith(
      "session-1",
      VALID_INPUT,
    );
  });

  it("returns generated questions when session pool misses", async () => {
    mockTwoGeneratedQuestions();
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(consumeQuestionFromTestSessionPool).toHaveBeenCalledWith(
      "session-1",
      VALID_INPUT,
    );
    expect(generateQuestionWithAI).toHaveBeenCalledTimes(1);
    expect(generateQuestionWithAI).toHaveBeenCalledWith(VALID_INPUT);
    expect(upsertQuestionPool).toHaveBeenNthCalledWith(1, {
      id: VALID_QUESTION.id,
      subjectId: VALID_INPUT.subjectId,
      subcategoryId: VALID_INPUT.subcategoryId,
      difficulty: VALID_INPUT.difficulty,
      questionType: VALID_QUESTION.questionType,
      prompt: VALID_QUESTION.prompt,
      options: VALID_QUESTION.options,
      correctOptionIds: VALID_QUESTION.correctOptionIds,
    });
    expect(upsertQuestionPool).toHaveBeenNthCalledWith(2, {
      id: VALID_NEXT_QUESTION.id,
      subjectId: VALID_INPUT.subjectId,
      subcategoryId: VALID_INPUT.subcategoryId,
      difficulty: VALID_INPUT.difficulty,
      questionType: VALID_NEXT_QUESTION.questionType,
      prompt: VALID_NEXT_QUESTION.prompt,
      options: VALID_NEXT_QUESTION.options,
      correctOptionIds: VALID_NEXT_QUESTION.correctOptionIds,
    });
    expect(upsertTestSessionQuestionPoolLink).toHaveBeenNthCalledWith(
      1,
      "session-1",
      VALID_QUESTION.id,
    );
    expect(upsertTestSessionQuestionPoolLink).toHaveBeenNthCalledWith(
      2,
      "session-1",
      VALID_NEXT_QUESTION.id,
    );
  });

  it("returns 400 for invalid request payload", async () => {
    parseQuestionParam.mockReturnValueOnce(null);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, and difficulty are required.",
    });
    expect(consumeQuestionFromTestSessionPool).not.toHaveBeenCalled();
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
    expect(upsertTestSessionQuestionPoolLink).not.toHaveBeenCalled();
  });

  it("returns 500 when question generation throws", async () => {
    generateQuestionWithAI.mockRejectedValueOnce(new Error("provider down"));
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "provider down",
    });
    expect(consumeQuestionFromTestSessionPool).toHaveBeenCalledWith(
      "session-1",
      VALID_INPUT,
    );
    expect(upsertQuestionPool).not.toHaveBeenCalled();
    expect(upsertTestSessionQuestionPoolLink).not.toHaveBeenCalled();
  });

  it("returns question even when pool persistence fails", async () => {
    mockTwoGeneratedQuestions();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    upsertQuestionPool.mockRejectedValueOnce(new Error("db down"));
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(consumeQuestionFromTestSessionPool).toHaveBeenCalledWith(
      "session-1",
      VALID_INPUT,
    );
    expect(upsertQuestionPool).toHaveBeenCalledTimes(2);
    expect(upsertTestSessionQuestionPoolLink).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to persist generated question.",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("short-circuits to mock questions when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    generateMockQuestion.mockReturnValueOnce(VALID_QUESTION);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: VALID_QUESTION,
    });
    expect(readAuthenticatedUserId).not.toHaveBeenCalled();
    expect(readAnonymousTestSessionCookie).not.toHaveBeenCalled();
    expect(readTestSession).not.toHaveBeenCalled();
    expect(consumeQuestionFromTestSessionPool).not.toHaveBeenCalled();
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
    expect(upsertTestSessionQuestionPoolLink).not.toHaveBeenCalled();
    expect(generateMockQuestion).toHaveBeenCalledTimes(1);
  });
});
