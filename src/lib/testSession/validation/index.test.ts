import { describe, expect, it } from "vitest";
import { parseTestParam, parseTestSession } from "@/lib/testSession/validation";

describe("parseTestParam", () => {
  it("parses a valid test session payload", () => {
    const parsed = parseTestParam({
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
      parseTestParam({
        difficulty: "beginner",
        goal: "unknown",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});

describe("parseTestSession", () => {
  it("parses a valid session payload with startedAtMs", () => {
    expect(
      parseTestSession({
        correctCount: 2,
        difficulty: "beginner",
        goal: "study",
        id: "session-1",
        startedAtMs: 1_738_000_000_000,
        submittedCount: 3,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toEqual({
      correctCount: 2,
      difficulty: "beginner",
      goal: "study",
      id: "session-1",
      startedAtMs: 1_738_000_000_000,
      submittedCount: 3,
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("returns null when startedAtMs is missing", () => {
    expect(
      parseTestSession({
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });

  it("returns null when id is missing", () => {
    expect(
      parseTestSession({
        difficulty: "beginner",
        goal: "study",
        startedAtMs: 1_738_000_000_000,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });

  it("returns null when correctCount is missing", () => {
    expect(
      parseTestSession({
        difficulty: "beginner",
        goal: "study",
        id: "session-1",
        startedAtMs: 1_738_000_000_000,
        submittedCount: 3,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });

  it("returns null when submittedCount is missing", () => {
    expect(
      parseTestSession({
        correctCount: 2,
        difficulty: "beginner",
        goal: "study",
        id: "session-1",
        startedAtMs: 1_738_000_000_000,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});
