import { QUESTION_TYPES } from "@/lib/meta";
import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import {
  isAnswerCorrect,
  isOptionCorrect,
  isOptionWrongSelection,
} from "./evaluation";

const mockQuestion: Question = {
  id: "q-1",
  questionType: QUESTION_TYPES.MULTIPLE_ANSWER,
  prompt: "Pick all prime numbers below.",
  options: [
    { id: "A", text: "2", explanation: "2 is prime." },
    { id: "B", text: "3", explanation: "3 is prime." },
    { id: "C", text: "4", explanation: "4 is composite." },
    { id: "D", text: "6", explanation: "6 is composite." },
  ],
  correctOptionIds: ["A", "B"],
};

describe("question evaluation utils", () => {
  it("returns false for isOptionCorrect when question is null", () => {
    expect(isOptionCorrect(null, "A")).toBe(false);
  });

  it("detects whether an option is correct", () => {
    expect(isOptionCorrect(mockQuestion, "A")).toBe(true);
    expect(isOptionCorrect(mockQuestion, "C")).toBe(false);
  });

  it("returns false for wrong selection when question is null", () => {
    expect(isOptionWrongSelection(null, ["A"], "A")).toBe(false);
  });

  it("returns true only for selected incorrect options", () => {
    expect(isOptionWrongSelection(mockQuestion, ["C"], "C")).toBe(true);
    expect(isOptionWrongSelection(mockQuestion, ["A"], "A")).toBe(false);
  });

  it("returns false for unselected options", () => {
    expect(isOptionWrongSelection(mockQuestion, ["A"], "D")).toBe(false);
  });

  it("returns true only when selected answers exactly match correct answers", () => {
    expect(isAnswerCorrect(mockQuestion, ["A", "B"])).toBe(true);
    expect(isAnswerCorrect(mockQuestion, ["A"])).toBe(false);
    expect(isAnswerCorrect(mockQuestion, ["A", "C"])).toBe(false);
  });

  it("returns false for duplicated selected options", () => {
    expect(isAnswerCorrect(mockQuestion, ["A", "A"])).toBe(false);
  });
});
