import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  buildQuestion,
  parseTestParam,
  readQuestionFromPool,
  upsertQuestionPool,
} = vi.hoisted(() => ({
  buildQuestion: vi.fn(),
  parseTestParam: vi.fn(),
  readQuestionFromPool: vi.fn(),
  upsertQuestionPool: vi.fn(),
}));

vi.mock("@/lib/validation/testSession", () => ({
  parseTestParam,
}));

vi.mock("./service/question", () => ({
  buildQuestion,
}));

vi.mock("../pool/repo", () => ({
  readQuestionFromPool,
  upsertQuestionPool,
}));

const VALID_INPUT = {
  difficulty: "beginner",
  goal: "study",
  subjectId: "language",
  subcategoryId: "english",
};

const VALID_QUESTION = {
  id: "question-1",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  options: [
    { id: "A", text: "Paris", explanation: "Correct." },
    { id: "B", text: "Berlin", explanation: "Incorrect." },
  ],
  correctOptionIds: ["A"],
} as const;

describe("generate question route", () => {
  beforeEach(() => {
    vi.resetModules();
    buildQuestion.mockReset();
    parseTestParam.mockReset();
    readQuestionFromPool.mockReset();
    upsertQuestionPool.mockReset();

    parseTestParam.mockReturnValue(VALID_INPUT);
    readQuestionFromPool.mockResolvedValue(null);
    buildQuestion.mockResolvedValue(VALID_QUESTION);
    upsertQuestionPool.mockResolvedValue(undefined);
  });

  it("returns pooled question without generating", async () => {
    readQuestionFromPool.mockResolvedValueOnce(VALID_QUESTION);
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
    expect(readQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(buildQuestion).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
  });

  it("returns question when request succeeds", async () => {
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
    expect(readQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(buildQuestion).toHaveBeenCalledWith(VALID_INPUT);
    expect(upsertQuestionPool).toHaveBeenCalledWith({
      id: VALID_QUESTION.id,
      subjectId: VALID_INPUT.subjectId,
      subcategoryId: VALID_INPUT.subcategoryId,
      difficulty: VALID_INPUT.difficulty,
      goal: VALID_INPUT.goal,
      questionType: VALID_QUESTION.questionType,
      prompt: VALID_QUESTION.prompt,
      options: VALID_QUESTION.options,
      correctOptionIds: VALID_QUESTION.correctOptionIds,
    });
  });

  it("returns 400 for invalid request payload", async () => {
    parseTestParam.mockReturnValueOnce(null);

    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, difficulty, and goal are required.",
    });
    expect(readQuestionFromPool).not.toHaveBeenCalled();
    expect(buildQuestion).not.toHaveBeenCalled();
    expect(upsertQuestionPool).not.toHaveBeenCalled();
  });

  it("returns 500 when question generation throws", async () => {
    buildQuestion.mockRejectedValueOnce(new Error("provider down"));

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
    expect(readQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
    expect(upsertQuestionPool).not.toHaveBeenCalled();
  });

  it("returns question even when pool persistence fails", async () => {
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
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to persist generated question.",
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});
