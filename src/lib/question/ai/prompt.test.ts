import { describe, expect, it } from "vitest";
import {
  buildQuestionUserPrompt,
  OPENAI_QUESTION_SYSTEM_PROMPT,
} from "./prompt";

describe("aiPrompt", () => {
  it("defines a stable prompt with strict question length", () => {
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain("Return only valid JSON");
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain('"q"');
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain('"t"');
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain('"o"');
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain('"a"');
    expect(OPENAI_QUESTION_SYSTEM_PROMPT).toContain(
      "q length must be exactly 2",
    );
  });

  it("builds user prompt from test context", () => {
    const prompt = buildQuestionUserPrompt({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(prompt).toContain("Context:");
    expect(prompt).toContain("subject: language");
    expect(prompt).toContain("subcategory: english");
    expect(prompt).toContain("difficulty: CEFR A1-A2");
    expect(prompt).not.toContain("goal:");
    expect(prompt).not.toContain("objectively gradable");
  });

  it("uses japanese mapped level as the difficulty line", () => {
    const prompt = buildQuestionUserPrompt({
      difficulty: "advanced",
      subjectId: "language",
      subcategoryId: "japanese",
    });

    expect(prompt).toContain("difficulty: JLPT N2");
  });
});
