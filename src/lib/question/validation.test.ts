import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";
import {
  hasSingleCorrectOption,
  isQuestionType,
  parseCorrectOptionIndexes,
  parseQuestionDifficulty,
  parseQuestionOptions,
} from "./validation";

describe("question validation helpers", () => {
  it("recognizes supported question types", () => {
    expect(isQuestionType(QUESTION_TYPES.MULTIPLE_CHOICE)).toBe(true);
    expect(isQuestionType("invalid")).toBe(false);
  });

  it("parses valid options and enforces uniqueness", () => {
    expect(
      parseQuestionOptions([
        { text: "A", explanation: "A" },
        { text: "B", explanation: "B" },
        { text: "C", explanation: "C" },
      ]),
    ).toEqual([
      { text: "A", explanation: "A" },
      { text: "B", explanation: "B" },
      { text: "C", explanation: "C" },
    ]);
  });

  it("rejects option lists larger than the max allowed count", () => {
    expect(
      parseQuestionOptions([
        { text: "A", explanation: "A" },
        { text: "B", explanation: "B" },
        { text: "C", explanation: "C" },
        { text: "D", explanation: "D" },
        { text: "E", explanation: "E" },
      ]),
    ).toBeNull();
  });

  it("parses correct option indexes as subset of options", () => {
    const options = [
      { text: "A", explanation: "A" },
      { text: "B", explanation: "B" },
    ] as const;

    expect(parseCorrectOptionIndexes([0], options)).toEqual([0]);
    expect(parseCorrectOptionIndexes([2], options)).toBeNull();
  });

  it("accepts exactly one correct option", () => {
    expect(hasSingleCorrectOption([0])).toBe(true);
    expect(hasSingleCorrectOption([0, 1])).toBe(false);
  });

  it("parses non-empty difficulty values", () => {
    expect(parseQuestionDifficulty(" A1 ")).toBe("A1");
    expect(parseQuestionDifficulty("")).toBeNull();
    expect(parseQuestionDifficulty(null)).toBeNull();
  });
});
