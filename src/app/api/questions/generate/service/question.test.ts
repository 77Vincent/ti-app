import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateMockQuestion, generateQuestionWithAI } = vi.hoisted(() => ({
  generateMockQuestion: vi.fn(),
  generateQuestionWithAI: vi.fn(),
}));

vi.mock("../mock", () => ({
  generateMockQuestion,
}));

vi.mock("../ai", () => ({
  generateQuestionWithAI,
}));

import { buildQuestion } from "./question";

const VALID_INPUT = {
  difficulty: "beginner",
  subjectId: "language",
  subcategoryId: "english",
};

describe("buildQuestion", () => {
  beforeEach(() => {
    generateMockQuestion.mockReset();
    generateQuestionWithAI.mockReset();
    delete process.env.OPENAI_API_KEY;
  });

  it("uses mock generator when OPENAI_API_KEY is missing", async () => {
    generateMockQuestion.mockReturnValueOnce({ id: "mock-1" });

    await expect(buildQuestion(VALID_INPUT)).resolves.toEqual({ id: "mock-1" });
    expect(generateMockQuestion).toHaveBeenCalledWith(VALID_INPUT);
    expect(generateQuestionWithAI).not.toHaveBeenCalled();
  });

  it("uses AI generator when OPENAI_API_KEY exists", async () => {
    process.env.OPENAI_API_KEY = "key";
    generateQuestionWithAI.mockResolvedValueOnce({ id: "ai-1" });

    await expect(buildQuestion(VALID_INPUT)).resolves.toEqual({ id: "ai-1" });
    expect(generateQuestionWithAI).toHaveBeenCalledWith(VALID_INPUT);
    expect(generateMockQuestion).not.toHaveBeenCalled();
  });
});
