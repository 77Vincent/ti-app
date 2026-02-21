import { describe, expect, it } from "vitest";
import {
  AI_QUESTION_SYSTEM_PROMPT,
  buildQuestionUserPrompt,
} from "./prompt";

describe("aiPrompt", () => {
  it("defines a stable prompt with strict question length", () => {
    expect(AI_QUESTION_SYSTEM_PROMPT).toContain("Return only valid JSON");
    expect(AI_QUESTION_SYSTEM_PROMPT).toContain('"p"');
    expect(AI_QUESTION_SYSTEM_PROMPT).toContain('"o"');
    expect(AI_QUESTION_SYSTEM_PROMPT).toContain('"a"');
    expect(AI_QUESTION_SYSTEM_PROMPT).toContain(
      "array length must be exactly 2",
    );
  });

  it("builds user prompt from test context", () => {
    const prompt = buildQuestionUserPrompt({
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(prompt).toContain("Context:");
    expect(prompt).toContain("subject: language");
    expect(prompt).toContain("subcategory: english");
    expect(prompt).not.toContain("objectively gradable");
  });
});
