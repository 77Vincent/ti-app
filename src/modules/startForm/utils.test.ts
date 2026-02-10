import { describe, expect, it } from "vitest";

import { getCurrentStartFormStep, canGoBackFromStep, getStartFormTitle } from "./utils";

describe("startForm utils", () => {
  it("derives current step from selected state", () => {
    expect(
      getCurrentStartFormStep({
        selectedSubjectId: null,
        selectedSubcategoryId: null,
        selectedDifficulty: null,
      }),
    ).toBe("subject");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: null,
        selectedDifficulty: null,
      }),
    ).toBe("subcategory");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: "english",
        selectedDifficulty: null,
      }),
    ).toBe("difficulty");

    expect(
      getCurrentStartFormStep({
        selectedSubjectId: "language",
        selectedSubcategoryId: "english",
        selectedDifficulty: "beginner",
      }),
    ).toBe("questionCount");
  });

  it("returns title and back-button availability by step", () => {
    expect(canGoBackFromStep("subject")).toBe(false);
    expect(canGoBackFromStep("subcategory")).toBe(true);
    expect(canGoBackFromStep("difficulty")).toBe(true);
    expect(canGoBackFromStep("questionCount")).toBe(true);

    expect(getStartFormTitle("subject")).toBe("Choose the subject of your test");
    expect(getStartFormTitle("questionCount")).toBe("Choose the number of questions");
  });
});
