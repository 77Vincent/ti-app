import { describe, expect, it } from "vitest";

import { getCurrentStartFormStep, canGoBackFromStep, getStartFormTitle } from "./utils";

describe("startForm utils", () => {
  it("derives current step from selected state", () => {
    expect(
      getCurrentStartFormStep({
        selectedSubjectId: null,
        selectedSubcategoryId: null,
        selectedDifficulty: null,
        selectedQuestionCount: null,
      }),
    ).toBe("subject");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: null,
        selectedDifficulty: null,
        selectedQuestionCount: null,
      }),
    ).toBe("subcategory");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: "english",
        selectedDifficulty: null,
        selectedQuestionCount: null,
      }),
    ).toBe("difficulty");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: "english",
        selectedDifficulty: "beginner",
        selectedQuestionCount: null,
      }),
    ).toBe("questionCount");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: "english",
        selectedDifficulty: "beginner",
        selectedQuestionCount: 10,
      }),
    ).toBe("timeLimit");
  });

  it("returns title and back-button availability by step", () => {
    expect(canGoBackFromStep("subject")).toBe(false);
    expect(canGoBackFromStep("subcategory")).toBe(true);
    expect(canGoBackFromStep("difficulty")).toBe(true);
    expect(canGoBackFromStep("questionCount")).toBe(true);
    expect(canGoBackFromStep("timeLimit")).toBe(true);

    expect(getStartFormTitle("subject")).toBe("Choose the subject of your test");
    expect(getStartFormTitle("questionCount")).toBe("Choose the number of questions");
    expect(getStartFormTitle("timeLimit")).toBe("Choose the time limit of the test");
  });
});
