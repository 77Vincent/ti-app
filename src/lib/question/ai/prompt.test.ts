import { describe, expect, it } from "vitest";
import {
  AI_QUESTION_SYSTEM_PROMPT,
  buildQuestionUserPrompt,
} from "./prompt";

function extractStyle(prompt: string): string | null {
  const match = prompt.match(/style:\s*(.+)/);
  return match?.[1]?.trim() ?? null;
}

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
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(prompt).toContain("Context:");
    expect(prompt).toContain("subject: language");
    expect(prompt).toContain("subcategory: english");
    expect(prompt).toContain("difficulty: CEFR A1-A2");
    expect(prompt).toContain("style:");
    expect(prompt).not.toContain("objectively gradable");
  });

  it("cycles styles in round robin order", () => {
    const first = buildQuestionUserPrompt({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });
    const second = buildQuestionUserPrompt({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });
    const third = buildQuestionUserPrompt({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    const firstStyle = extractStyle(first);
    const secondStyle = extractStyle(second);
    const thirdStyle = extractStyle(third);

    expect(firstStyle).not.toBeNull();
    expect(secondStyle).not.toBeNull();
    expect(thirdStyle).not.toBeNull();
    expect(firstStyle).not.toBe(secondStyle);
    expect(thirdStyle).toBe(firstStyle);
  });

  it("tracks style rotation per difficulty bucket", () => {
    const advancedFirst = buildQuestionUserPrompt({
      difficulty: "advanced",
      subjectId: "language",
      subcategoryId: "english",
    });
    buildQuestionUserPrompt({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });
    const advancedSecond = buildQuestionUserPrompt({
      difficulty: "advanced",
      subjectId: "language",
      subcategoryId: "english",
    });

    const advancedFirstStyle = extractStyle(advancedFirst);
    const advancedSecondStyle = extractStyle(advancedSecond);

    expect(advancedFirstStyle).not.toBeNull();
    expect(advancedSecondStyle).not.toBeNull();
    expect(advancedSecondStyle).not.toBe(advancedFirstStyle);
  });
});
