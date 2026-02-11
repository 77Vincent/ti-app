import { describe, expect, it } from "vitest";
import { buildQuestionSessionKey } from "./sessionKey";

describe("buildQuestionSessionKey", () => {
  it("builds a stable key from session fields", () => {
    const key = buildQuestionSessionKey({
      startedAtMs: 1739300000000,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "beginner",
      goal: "study",
    });

    expect(key).toBe("1739300000000:language:english:beginner:study");
  });
});
