import { describe, expect, it } from "vitest";
import { parseTestRunParams, parseTestRunSession } from "./params";

describe("parseTestRunParams", () => {
  it("parses a valid test session payload", () => {
    const parsed = parseTestRunParams({
      difficulty: "beginner",
      goal: "study",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(parsed).toEqual({
      difficulty: "beginner",
      goal: "study",
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("returns null for invalid payload", () => {
    expect(
      parseTestRunParams({
        difficulty: "beginner",
        goal: "unknown",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});

describe("parseTestRunSession", () => {
  it("parses a valid session payload with startedAtMs", () => {
    expect(
      parseTestRunSession({
        difficulty: "beginner",
        goal: "study",
        startedAtMs: 1_738_000_000_000,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toEqual({
      difficulty: "beginner",
      goal: "study",
      startedAtMs: 1_738_000_000_000,
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("returns null when startedAtMs is missing", () => {
    expect(
      parseTestRunSession({
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});
