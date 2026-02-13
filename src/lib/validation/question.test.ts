import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";
import {
  hasValidCorrectOptionCount,
  isQuestionType,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "./question";

describe("question validation helpers", () => {
  it("recognizes supported question types", () => {
    expect(isQuestionType(QUESTION_TYPES.MULTIPLE_CHOICE)).toBe(true);
    expect(isQuestionType(QUESTION_TYPES.MULTIPLE_ANSWER)).toBe(true);
    expect(isQuestionType("invalid")).toBe(false);
  });

  it("parses valid options and enforces uniqueness", () => {
    expect(
      parseQuestionOptions([
        { id: "A", text: "A", explanation: "A" },
        { id: "B", text: "B", explanation: "B" },
        { id: "C", text: "C", explanation: "C" },
      ]),
    ).toEqual([
      { id: "A", text: "A", explanation: "A" },
      { id: "B", text: "B", explanation: "B" },
      { id: "C", text: "C", explanation: "C" },
    ]);

    expect(
      parseQuestionOptions([
        { id: "A", text: "A", explanation: "A" },
        { id: "A", text: "B", explanation: "B" },
      ]),
    ).toBeNull();
  });

  it("enforces sequential option ids when requested", () => {
    expect(
      parseQuestionOptions(
        [
          { id: "A", text: "A", explanation: "A" },
          { id: "C", text: "C", explanation: "C" },
          { id: "D", text: "D", explanation: "D" },
        ],
        { requireSequentialFromA: true },
      ),
    ).toBeNull();
  });

  it("parses correct option ids as subset of option ids", () => {
    const options = [
      { id: "A", text: "A", explanation: "A" },
      { id: "B", text: "B", explanation: "B" },
    ] as const;

    expect(parseCorrectOptionIds(["A"], options)).toEqual(["A"]);
    expect(parseCorrectOptionIds(["C"], options)).toBeNull();
  });

  it("validates correct answer count by question type", () => {
    expect(
      hasValidCorrectOptionCount(QUESTION_TYPES.MULTIPLE_CHOICE, ["A"]),
    ).toBe(true);
    expect(
      hasValidCorrectOptionCount(QUESTION_TYPES.MULTIPLE_CHOICE, ["A", "B"]),
    ).toBe(false);
    expect(
      hasValidCorrectOptionCount(QUESTION_TYPES.MULTIPLE_ANSWER, ["A", "B"]),
    ).toBe(true);
    expect(
      hasValidCorrectOptionCount(QUESTION_TYPES.MULTIPLE_ANSWER, ["A"]),
    ).toBe(false);
  });
});
