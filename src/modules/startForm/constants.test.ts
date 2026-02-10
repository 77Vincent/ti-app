import { describe, expect, it } from "vitest";

import {
  INFINITE_QUESTION_COUNT,
  QUESTION_COUNT_OPTIONS,
  START_FORM_STEP_TITLES,
} from "./constants";

describe("startForm constants", () => {
  it("includes expected finite and infinite question count options", () => {
    expect(QUESTION_COUNT_OPTIONS.map((option) => option.value)).toEqual([
      5,
      10,
      15,
      20,
      30,
      40,
      50,
      INFINITE_QUESTION_COUNT,
    ]);

    const infiniteOption = QUESTION_COUNT_OPTIONS.find(
      (option) => option.value === INFINITE_QUESTION_COUNT,
    );

    expect(infiniteOption?.label).toBe("Infinite");
  });

  it("defines all start form step titles", () => {
    expect(START_FORM_STEP_TITLES).toEqual({
      subject: "Choose the subject of your test",
      subcategory: "Choose the subcategory",
      difficulty: "Choose the difficulty",
      questionCount: "Choose the number of questions",
    });
  });
});
