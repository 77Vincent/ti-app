import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  requestOpenAIQuestionContent,
  parseAIQuestionPayload,
} = vi.hoisted(() => ({
  requestOpenAIQuestionContent: vi.fn(),
  parseAIQuestionPayload: vi.fn(),
}));

vi.mock("./client", () => ({
  requestOpenAIQuestionContent,
}));

vi.mock("./payload", () => ({
  parseAIQuestionPayload,
}));

import { generateQuestionWithAI } from "./generate";

const VALID_INPUT = {
  difficulty: "beginner",
  subjectId: "language",
  subcategoryId: "english",
} as const;

describe("generateQuestionWithAI", () => {
  beforeEach(() => {
    requestOpenAIQuestionContent.mockReset();
    parseAIQuestionPayload.mockReset();
  });

  it("orchestrates client and payload parser", async () => {
    requestOpenAIQuestionContent.mockResolvedValueOnce("{\"ok\":true}");
    parseAIQuestionPayload.mockReturnValueOnce([
      {
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
        prompt: "Q1",
        options: [
          { id: "A", text: "A1", explanation: "A1" },
          { id: "B", text: "B1", explanation: "B1" },
          { id: "C", text: "C1", explanation: "C1" },
        ],
        correctOptionIds: ["A"],
      },
      {
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
        prompt: "Q2",
        options: [
          { id: "A", text: "A2", explanation: "A2" },
          { id: "B", text: "B2", explanation: "B2" },
          { id: "C", text: "C2", explanation: "C2" },
        ],
        correctOptionIds: ["B"],
      },
    ]);

    const [question, nextQuestion] = await generateQuestionWithAI(VALID_INPUT);

    expect(requestOpenAIQuestionContent).toHaveBeenCalledWith(VALID_INPUT);
    expect(parseAIQuestionPayload).toHaveBeenCalledWith("{\"ok\":true}");
    expect(question).toMatchObject({
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "Q1",
      correctOptionIds: ["A"],
    });
    expect(nextQuestion).toMatchObject({
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "Q2",
      correctOptionIds: ["B"],
    });
    expect(typeof question.id).toBe("string");
    expect(typeof nextQuestion.id).toBe("string");
  });

  it("propagates client errors", async () => {
    requestOpenAIQuestionContent.mockRejectedValueOnce(
      new Error("provider down"),
    );

    await expect(generateQuestionWithAI(VALID_INPUT)).rejects.toThrow(
      "provider down",
    );
    expect(parseAIQuestionPayload).not.toHaveBeenCalled();
  });
});
