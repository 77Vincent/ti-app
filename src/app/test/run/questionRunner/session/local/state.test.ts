import { QUESTION_TYPES } from "@/lib/meta";
import { describe, expect, it } from "vitest";
import {
  calculateLocalTestSessionAccuracy,
  initializeLocalTestSessionSnapshot,
  shiftLocalTestSessionSnapshotQuestion,
  toLocalTestSessionQuestionState,
  updateCurrentLocalTestSessionSnapshotQuestion,
  upsertLocalTestSessionSnapshotQuestion,
  type LocalTestSessionSnapshot,
} from "./state";

function createQuestion(id: string) {
  return {
    id,
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: `Prompt ${id}`,
    options: [{ id: "A", text: "A", explanation: "A" }],
    correctOptionIds: ["A"],
  };
}

describe("local test session state", () => {
  it("initializes from existing snapshot only when session id matches", () => {
    const existing: LocalTestSessionSnapshot = {
      sessionId: "session-1",
      questions: [
        {
          question: createQuestion("q1"),
          selectedOptionIds: ["A"],
          hasSubmitted: true,
        },
      ],
      currentQuestionIndex: 0,
    };

    expect(
      initializeLocalTestSessionSnapshot(existing, "session-1"),
    ).toEqual(existing);
    expect(
      initializeLocalTestSessionSnapshot(existing, "session-2"),
    ).toEqual({
      sessionId: "session-2",
      questions: [],
      currentQuestionIndex: 0,
    });
  });

  it("upserts question and exposes current question state", () => {
    const snapshot: LocalTestSessionSnapshot = {
      sessionId: "session-1",
      questions: [],
      currentQuestionIndex: 0,
    };

    const next = upsertLocalTestSessionSnapshotQuestion(snapshot, createQuestion("q1"));
    expect(next.currentQuestionIndex).toBe(0);
    expect(next.questions).toHaveLength(1);
    expect(toLocalTestSessionQuestionState(next)).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 0,
    });
  });

  it("shifts and updates current question entry", () => {
    const snapshot: LocalTestSessionSnapshot = {
      sessionId: "session-1",
      questions: [
        {
          question: createQuestion("q1"),
          selectedOptionIds: [],
          hasSubmitted: false,
        },
        {
          question: createQuestion("q2"),
          selectedOptionIds: [],
          hasSubmitted: false,
        },
      ],
      currentQuestionIndex: 0,
    };

    const shifted = shiftLocalTestSessionSnapshotQuestion(snapshot, 1);
    expect(shifted?.currentQuestionIndex).toBe(1);

    const updated = updateCurrentLocalTestSessionSnapshotQuestion(
      shifted as LocalTestSessionSnapshot,
      (questionEntry) => ({
        ...questionEntry,
        selectedOptionIds: ["A"],
      }),
    );
    expect(updated?.questions[1]?.selectedOptionIds).toEqual(["A"]);
  });

  it("calculates submitted/correct counts and accuracy rate", () => {
    const snapshot: LocalTestSessionSnapshot = {
      sessionId: "session-1",
      questions: [
        {
          question: {
            ...createQuestion("q1"),
            correctOptionIds: ["A"],
          },
          selectedOptionIds: ["A"],
          hasSubmitted: true,
        },
        {
          question: {
            ...createQuestion("q2"),
            correctOptionIds: ["A", "C"],
          },
          selectedOptionIds: ["C", "A"],
          hasSubmitted: true,
        },
        {
          question: {
            ...createQuestion("q3"),
            correctOptionIds: ["A"],
          },
          selectedOptionIds: ["B"],
          hasSubmitted: true,
        },
        {
          question: createQuestion("q4"),
          selectedOptionIds: ["A"],
          hasSubmitted: false,
        },
      ],
      currentQuestionIndex: 0,
    };

    expect(calculateLocalTestSessionAccuracy(snapshot)).toEqual({
      submittedCount: 3,
      correctCount: 2,
      accuracyRate: 2 / 3,
    });
  });
});
