import { describe, expect, it } from "vitest";
import { parseTestRunParams } from "./params";

describe("parseTestRunParams", () => {
  it("parses a valid test session payload", () => {
    const parsed = parseTestRunParams({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(parsed).toEqual({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("returns null for invalid payload", () => {
    expect(
      parseTestRunParams({
        difficulty: "unknown",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});
