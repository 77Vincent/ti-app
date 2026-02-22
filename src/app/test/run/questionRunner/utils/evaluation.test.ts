import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import {
  isAnswerCorrect,
  isOptionCorrect,
  isOptionWrongSelection,
} from "./evaluation";

const mockQuestion: Question = {
  id: "q-1",
  prompt: "Pick the prime number below.",
  difficulty: "A1",
  options: [
    { text: "2", explanation: "2 is prime." },
    { text: "4", explanation: "4 is composite." },
    { text: "6", explanation: "6 is composite." },
    { text: "8", explanation: "8 is composite." },
  ],
  correctOptionIndexes: [0],
};

describe("question evaluation utils", () => {
  it("returns false for isOptionCorrect when question is null", () => {
    expect(isOptionCorrect(null, 0)).toBe(false);
  });

  it("detects whether an option is correct", () => {
    expect(isOptionCorrect(mockQuestion, 0)).toBe(true);
    expect(isOptionCorrect(mockQuestion, 2)).toBe(false);
  });

  it("returns false for wrong selection when question is null", () => {
    expect(isOptionWrongSelection(null, [0], 0)).toBe(false);
  });

  it("returns true only for selected incorrect options", () => {
    expect(isOptionWrongSelection(mockQuestion, [2], 2)).toBe(true);
    expect(isOptionWrongSelection(mockQuestion, [0], 0)).toBe(false);
  });

  it("returns false for unselected options", () => {
    expect(isOptionWrongSelection(mockQuestion, [0], 3)).toBe(false);
  });

  it("returns true only when selected answers exactly match correct answers", () => {
    expect(isAnswerCorrect(mockQuestion, [0])).toBe(true);
    expect(isAnswerCorrect(mockQuestion, [1])).toBe(false);
    expect(isAnswerCorrect(mockQuestion, [0, 2])).toBe(false);
  });

  it("returns false for duplicated selected options", () => {
    expect(isAnswerCorrect(mockQuestion, [0, 0])).toBe(false);
  });
});
