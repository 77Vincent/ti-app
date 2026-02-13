import { describe, expect, it } from "vitest";
import {
  buildQuestionUserPrompt,
  OPENAI_QUESTION_SYSTEM_PROMPT,
} from "./prompt";

describe("aiPrompt", () => {
  it("keeps the system prompt stable for JSON-only output", () => {
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain("Return only valid JSON");
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain('"correctOptionIds"');
  });

  it("builds user prompt from test context", () => {
    const prompt = buildQuestionUserPrompt({
      difficulty: "beginner",
      goal: "study",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(prompt).toContain("subjectId: language");
    expect(prompt).toContain("subcategoryId: english");
    expect(prompt).toContain("difficulty: CEFR A1-A2");
    expect(prompt).toContain("goal: study");
  });

  it("uses japanese mapped level as the difficulty line", () => {
    const prompt = buildQuestionUserPrompt({
      difficulty: "advanced",
      goal: "exam",
      subjectId: "language",
      subcategoryId: "japanese",
    });

    expect(prompt).toContain("difficulty: JLPT N2");
  });
});
