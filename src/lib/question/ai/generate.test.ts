import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const { requestOpenAIQuestionContent, parseAIQuestionPayload } = vi.hoisted(() => ({
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
  goal: "study",
  subjectId: "language",
  subcategoryId: "english",
} as const;

describe("generateQuestionWithAI", () => {
  beforeEach(() => {
    requestOpenAIQuestionContent.mockReset();
    parseAIQuestionPayload.mockReset();
  });

  it("orchestrates ai client and payload parser", async () => {
    requestOpenAIQuestionContent.mockResolvedValueOnce("{\"ok\":true}");
    parseAIQuestionPayload.mockReturnValueOnce({
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "What is the capital of France?",
      options: [
        { id: "A", text: "Berlin", explanation: "Wrong." },
        { id: "B", text: "Paris", explanation: "Correct." },
        { id: "C", text: "Madrid", explanation: "Wrong." },
        { id: "D", text: "Rome", explanation: "Wrong." },
      ],
      correctOptionIds: ["B"],
    });

    const question = await generateQuestionWithAI(VALID_INPUT);

    expect(requestOpenAIQuestionContent).toHaveBeenCalledWith(VALID_INPUT);
    expect(parseAIQuestionPayload).toHaveBeenCalledWith('{"ok":true}');
    expect(question).toMatchObject({
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "What is the capital of France?",
      correctOptionIds: ["B"],
    });
    expect(typeof question.id).toBe("string");
    expect(question.id.length).toBeGreaterThan(0);
  });

  it("propagates client errors", async () => {
    requestOpenAIQuestionContent.mockRejectedValueOnce(new Error("provider down"));

    await expect(generateQuestionWithAI(VALID_INPUT)).rejects.toThrow(
      "provider down",
    );
    expect(parseAIQuestionPayload).not.toHaveBeenCalled();
  });
});
