import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  parseQuestionParam,
  readRandomQuestionFromPool,
} = vi.hoisted(() => ({
  parseQuestionParam: vi.fn(),
  readRandomQuestionFromPool: vi.fn(),
}));

vi.mock("@/lib/testSession/validation", () => ({
  parseQuestionParam,
}));

vi.mock("../pool/repo", () => ({
  readRandomQuestionFromPool,
}));

const VALID_INPUT = {
  difficulty: "beginner",
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
    { id: "C", text: "Madrid", explanation: "Incorrect." },
  ],
  correctOptionIds: ["A"],
} as const;

describe("generate question route", () => {
  beforeEach(() => {
    vi.resetModules();
    parseQuestionParam.mockReset();
    readRandomQuestionFromPool.mockReset();

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    readRandomQuestionFromPool.mockResolvedValue(VALID_QUESTION);
  });

  it("returns a random pooled question", async () => {
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
    expect(readRandomQuestionFromPool).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("returns 404 when no pooled question exists", async () => {
    readRandomQuestionFromPool.mockResolvedValueOnce(null);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
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
      new Request("http://localhost/api/questions/generate", {
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
      new Request("http://localhost/api/questions/generate", {
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
      new Request("http://localhost/api/questions/generate", {
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
