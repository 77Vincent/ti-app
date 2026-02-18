import { describe, expect, it } from "vitest";
import { parseTestParam, parseTestSession } from "@/lib/testSession/validation";

describe("parseTestParam", () => {
  it("parses a valid test session payload", () => {
    const parsed = parseTestParam({
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
      parseTestParam({
        difficulty: "unknown",
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
        id: "session-1",
        startedAtMs: 1_738_000_000_000,
        submittedCount: 3,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toEqual({
      correctCount: 2,
      difficulty: "beginner",
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
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });

  it("returns null when id is missing", () => {
    expect(
      parseTestSession({
        difficulty: "beginner",
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
        id: "session-1",
        startedAtMs: 1_738_000_000_000,
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).toBeNull();
  });
});
