import { QUESTION_TYPES } from "@/lib/meta";
import { describe, expect, it } from "vitest";
import {
  parseLocalTestSessionSnapshot,
  parseLocalTestSessionSnapshotJson,
} from "./snapshot";

const VALID_SNAPSHOT = {
  sessionId: "session-1",
  questions: [
    {
      question: {
        id: "q1",
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
        prompt: "Prompt q1",
        options: [{ id: "A", text: "A" }],
        correctOptionIds: ["A"],
      },
      selectedOptionIds: ["A"],
      hasSubmitted: true,
    },
  ],
  currentQuestionIndex: 0,
} as const;

describe("local test session codec", () => {
  it("parses a valid snapshot payload", () => {
    expect(parseLocalTestSessionSnapshot(VALID_SNAPSHOT)).toEqual(VALID_SNAPSHOT);
  });

  it("returns null for malformed json payload", () => {
    expect(parseLocalTestSessionSnapshotJson("not-json")).toBeNull();
  });

  it("rejects snapshot with invalid current question index", () => {
    expect(
      parseLocalTestSessionSnapshot({
        ...VALID_SNAPSHOT,
        currentQuestionIndex: 999,
      }),
    ).toBeNull();
  });
});
