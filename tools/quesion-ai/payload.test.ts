import { describe, expect, it } from "vitest";
import { QUESTION_TYPE_MULTIPLE_CHOICE } from "./types";
import { parseAIQuestionPayload } from "./payload";

const VALID_COMPACT_QUESTION = {
  p: "What is the capital of France?",
  d: "A2",
  o: [
    ["Berlin", "Wrong."],
    ["Paris", "Correct."],
    ["Madrid", "Wrong."],
    ["Rome", "Wrong."],
  ],
  a: [1],
} as const;

const VALID_PARSED_QUESTION = {
  questionType: QUESTION_TYPE_MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  difficulty: "A2",
  options: [
    { text: "Berlin", explanation: "Wrong." },
    { text: "Paris", explanation: "Correct." },
    { text: "Madrid", explanation: "Wrong." },
    { text: "Rome", explanation: "Wrong." },
  ],
  correctOptionIndexes: [1],
};

describe("parseAIQuestionPayload", () => {
  it("parses valid JSON payload with exactly two questions", () => {
    const parsed = parseAIQuestionPayload(
      JSON.stringify([VALID_COMPACT_QUESTION, VALID_COMPACT_QUESTION]),
    );

    expect(parsed).toEqual([VALID_PARSED_QUESTION, VALID_PARSED_QUESTION]);
  });

  it("throws when array length is not 2", () => {
    expect(() =>
      parseAIQuestionPayload(
        JSON.stringify([VALID_COMPACT_QUESTION]),
      ),
    ).toThrow("AI response shape is invalid.");
  });

  it("throws when one question has invalid correct options", () => {
    const invalidCompactQuestion = {
      ...VALID_COMPACT_QUESTION,
      a: [0, 1],
    };

    expect(() =>
      parseAIQuestionPayload(
        JSON.stringify([VALID_COMPACT_QUESTION, invalidCompactQuestion]),
      ),
    ).toThrow("AI multiple_choice must have exactly one correct option.");
  });

  it("throws when one answer index is out of range", () => {
    const invalidCompactQuestion = {
      ...VALID_COMPACT_QUESTION,
      a: [9],
    };

    expect(() =>
      parseAIQuestionPayload(
        JSON.stringify([VALID_COMPACT_QUESTION, invalidCompactQuestion]),
      ),
    ).toThrow("AI correct options are invalid.");
  });

  it("throws when question payload misses prompt", () => {
    const invalidCompactQuestion = {
      ...VALID_COMPACT_QUESTION,
      p: "",
    };

    expect(() =>
      parseAIQuestionPayload(
        JSON.stringify([VALID_COMPACT_QUESTION, invalidCompactQuestion]),
      ),
    ).toThrow("AI response shape is invalid.");
  });

  it("throws when question payload misses difficulty", () => {
    const invalidCompactQuestion = {
      ...VALID_COMPACT_QUESTION,
      d: "",
    };

    expect(() =>
      parseAIQuestionPayload(
        JSON.stringify([VALID_COMPACT_QUESTION, invalidCompactQuestion]),
      ),
    ).toThrow("AI response shape is invalid.");
  });
});
