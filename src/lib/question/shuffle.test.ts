import { describe, expect, it } from "vitest";
import type { Question } from "./model";
import { shuffleQuestionOptions } from "./shuffle";

const SAMPLE_QUESTION: Question = {
  id: "question-1",
  prompt: "Sample",
  difficulty: "A1",
  options: [
    { text: "A", explanation: "correct" },
    { text: "B", explanation: "wrong" },
    { text: "C", explanation: "wrong" },
    { text: "D", explanation: "wrong" },
  ],
  correctOptionIndexes: [0],
};

describe("shuffleQuestionOptions", () => {
  it("returns deterministic order for the same seed key", () => {
    const first = shuffleQuestionOptions(SAMPLE_QUESTION, "session-1:question-1");
    const second = shuffleQuestionOptions(SAMPLE_QUESTION, "session-1:question-1");

    expect(first.options).toEqual(second.options);
    expect(first.correctOptionIndexes).toEqual(second.correctOptionIndexes);
  });

  it("keeps answer correctness aligned after shuffling", () => {
    const shuffled = shuffleQuestionOptions(SAMPLE_QUESTION, "session-2:question-1");
    const correctIndex = shuffled.correctOptionIndexes[0];

    expect(shuffled.options[correctIndex]?.text).toBe("A");
  });

  it("can remap multiple correct answers", () => {
    const multiCorrectQuestion: Question = {
      ...SAMPLE_QUESTION,
      correctOptionIndexes: [0, 2],
    };

    const shuffled = shuffleQuestionOptions(multiCorrectQuestion, "session-3:question-1");
    const correctOptionTexts = shuffled.correctOptionIndexes.map(
      (index) => shuffled.options[index]?.text,
    );

    expect(correctOptionTexts.sort()).toEqual(["A", "C"]);
  });
});
