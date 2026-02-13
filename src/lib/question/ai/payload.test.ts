import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";
import { parseAIQuestionPayload } from "./payload";

const VALID_PAYLOAD = {
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  options: [
    { id: "A", text: "Berlin", explanation: "Wrong." },
    { id: "B", text: "Paris", explanation: "Correct." },
    { id: "C", text: "Madrid", explanation: "Wrong." },
    { id: "D", text: "Rome", explanation: "Wrong." },
  ],
  correctOptionIds: ["B"],
};

describe("parseAIQuestionPayload", () => {
  it("parses valid JSON payload", () => {
    const parsed = parseAIQuestionPayload(JSON.stringify(VALID_PAYLOAD));

    expect(parsed).toEqual(VALID_PAYLOAD);
  });

  it("parses JSON object embedded in surrounding text", () => {
    const parsed = parseAIQuestionPayload(
      `noise before ${JSON.stringify(VALID_PAYLOAD)} noise after`,
    );

    expect(parsed).toEqual(VALID_PAYLOAD);
  });

  it("throws for invalid JSON", () => {
    expect(() => parseAIQuestionPayload("not-json")).toThrow(
      "AI response was not valid JSON.",
    );
  });

  it("throws when multiple_choice has more than one correct option", () => {
    const invalid = {
      ...VALID_PAYLOAD,
      correctOptionIds: ["A", "B"],
    };

    expect(() => parseAIQuestionPayload(JSON.stringify(invalid))).toThrow(
      "AI multiple_choice must have exactly one correct option.",
    );
  });

  it("accepts payload with three options", () => {
    const payloadWithThreeOptions = {
      ...VALID_PAYLOAD,
      options: VALID_PAYLOAD.options.slice(0, 3),
    };

    expect(
      parseAIQuestionPayload(JSON.stringify(payloadWithThreeOptions)),
    ).toEqual(payloadWithThreeOptions);
  });
});
