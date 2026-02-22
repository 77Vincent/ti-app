import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPE_MULTIPLE_CHOICE } from "./types";

const {
  requestDeepSeekQuestionContent,
  parseAIQuestionPayload,
} = vi.hoisted(() => ({
  requestDeepSeekQuestionContent: vi.fn(),
  parseAIQuestionPayload: vi.fn(),
}));

vi.mock("./client", () => ({
  requestDeepSeekQuestionContent,
}));

vi.mock("./payload", () => ({
  parseAIQuestionPayload,
}));

import { generateQuestionWithAI } from "./generate";

const VALID_INPUT = {
  subjectId: "language",
  subcategoryId: "english",
} as const;

describe("generateQuestionWithAI", () => {
  beforeEach(() => {
    requestDeepSeekQuestionContent.mockReset();
    parseAIQuestionPayload.mockReset();
  });

  it("orchestrates client and payload parser", async () => {
    requestDeepSeekQuestionContent.mockResolvedValueOnce("{\"ok\":true}");
    parseAIQuestionPayload.mockReturnValueOnce([
      {
        questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
        prompt: "Q1",
        options: [
          { text: "A1", explanation: "A1" },
          { text: "B1", explanation: "B1" },
          { text: "C1", explanation: "C1" },
        ],
        correctOptionIndexes: [0],
      },
      {
        questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
        prompt: "Q2",
        options: [
          { text: "A2", explanation: "A2" },
          { text: "B2", explanation: "B2" },
          { text: "C2", explanation: "C2" },
        ],
        correctOptionIndexes: [1],
      },
    ]);

    const [question, nextQuestion] = await generateQuestionWithAI(VALID_INPUT);

    expect(requestDeepSeekQuestionContent).toHaveBeenCalledWith(VALID_INPUT);
    expect(parseAIQuestionPayload).toHaveBeenCalledWith("{\"ok\":true}");
    expect(question).toMatchObject({
      questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
      prompt: "Q1",
      correctOptionIndexes: [0],
    });
    expect(nextQuestion).toMatchObject({
      questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
      prompt: "Q2",
      correctOptionIndexes: [1],
    });
    expect(typeof question.id).toBe("string");
    expect(typeof nextQuestion.id).toBe("string");
  });

  it("propagates client errors", async () => {
    requestDeepSeekQuestionContent.mockRejectedValueOnce(
      new Error("provider down"),
    );

    await expect(generateQuestionWithAI(VALID_INPUT)).rejects.toThrow(
      "provider down",
    );
    expect(parseAIQuestionPayload).not.toHaveBeenCalled();
  });
});
