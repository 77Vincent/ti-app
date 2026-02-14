import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  countQuestionPoolMatches,
  generateMockQuestion,
  generateQuestionWithAI,
  parseQuestionParam,
  readQuestionFromPool,
  upsertQuestionPool,
} = vi.hoisted(() => ({
  countQuestionPoolMatches: vi.fn(),
  generateMockQuestion: vi.fn(),
  generateQuestionWithAI: vi.fn(),
  parseQuestionParam: vi.fn(),
  readQuestionFromPool: vi.fn(),
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
  countQuestionPoolMatches,
  readQuestionFromPool,
  upsertQuestionPool,
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
    countQuestionPoolMatches.mockReset();
    generateMockQuestion.mockReset();
    generateQuestionWithAI.mockReset();
    parseQuestionParam.mockReset();
    readQuestionFromPool.mockReset();
    upsertQuestionPool.mockReset();
    process.env.OPENAI_API_KEY = "test-key";

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    countQuestionPoolMatches.mockResolvedValue(0);
    readQuestionFromPool.mockResolvedValue(null);
    generateQuestionWithAI.mockResolvedValue([
      VALID_QUESTION,
      VALID_NEXT_QUESTION,
    ]);
    generateMockQuestion.mockReturnValue(VALID_QUESTION);
    upsertQuestionPool.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (typeof ORIGINAL_OPENAI_API_KEY === "string") {
      process.env.OPENAI_API_KEY = ORIGINAL_OPENAI_API_KEY;
      return;
    }

    delete process.env.OPENAI_API_KEY;
  });

  it("returns pooled question without generating", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    countQuestionPoolMatches.mockResolvedValueOnce(100);
    readQuestionFromPool.mockResolvedValueOnce([
      VALID_QUESTION,
      VALID_NEXT_QUESTION,
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
      nextQuestion: VALID_NEXT_QUESTION,
    });
    expect(countQuestionPoolMatches).toHaveBeenCalledWith(VALID_INPUT);
    expect(readQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
    randomSpy.mockRestore();
  });

  it("returns question when request succeeds", async () => {
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
      nextQuestion: VALID_NEXT_QUESTION,
    });
    expect(countQuestionPoolMatches).toHaveBeenCalledWith(VALID_INPUT);
    expect(readQuestionFromPool).not.toHaveBeenCalled();
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
    expect(countQuestionPoolMatches).not.toHaveBeenCalled();
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
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
    expect(countQuestionPoolMatches).toHaveBeenCalledWith(VALID_INPUT);
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
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
      nextQuestion: VALID_NEXT_QUESTION,
    });
    expect(countQuestionPoolMatches).toHaveBeenCalledWith(VALID_INPUT);
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(upsertQuestionPool).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to persist generated question.",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });

  it("skips pool read when probability falls through", async () => {
    mockTwoGeneratedQuestions();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);
    countQuestionPoolMatches.mockResolvedValueOnce(100);
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
      nextQuestion: VALID_NEXT_QUESTION,
    });
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(generateQuestionWithAI).toHaveBeenCalledTimes(1);
    expect(generateQuestionWithAI).toHaveBeenCalledWith(VALID_INPUT);
    randomSpy.mockRestore();
  });

  it("short-circuits to mock questions when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    generateMockQuestion
      .mockReturnValueOnce(VALID_QUESTION)
      .mockReturnValueOnce(VALID_NEXT_QUESTION);
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
      nextQuestion: VALID_QUESTION,
    });
    expect(countQuestionPoolMatches).not.toHaveBeenCalled();
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
    expect(generateMockQuestion).toHaveBeenCalledTimes(1);
  });
});
