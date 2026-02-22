import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import {
  INITIAL_QUESTION_SESSION_UI_STATE,
  questionSessionUiReducer,
} from "./reducer";

function createMockQuestion(id: string): Question {
  return {
    id,
    prompt: `Prompt ${id}`,
    difficulty: "A1",
    options: [
      { text: "A", explanation: "A explanation" },
      { text: "B", explanation: "B explanation" },
      { text: "C", explanation: "C explanation" },
      { text: "D", explanation: "D explanation" },
    ],
    correctOptionIndexes: [0],
  };
}

describe("questionSessionUiReducer", () => {
  it("applies a question and resets hasSubmitted", () => {
    const submittedState = {
      ...INITIAL_QUESTION_SESSION_UI_STATE,
      hasSubmitted: true,
    };
    const question = createMockQuestion("q1");

    const nextState = questionSessionUiReducer(submittedState, {
      type: "questionApplied",
      question,
    });

    expect(nextState.question).toEqual(question);
    expect(nextState.hasSubmitted).toBe(false);
  });

  it("handles initial load lifecycle", () => {
    const loadingState = questionSessionUiReducer(
      { ...INITIAL_QUESTION_SESSION_UI_STATE, isLoadingQuestion: false },
      { type: "initialLoadStarted" },
    );

    const finishedState = questionSessionUiReducer(loadingState, {
      type: "initialLoadFinished",
    });

    expect(loadingState.isLoadingQuestion).toBe(true);
    expect(finishedState.isLoadingQuestion).toBe(false);
  });

  it("handles submit fetch lifecycle", () => {
    const submittingState = questionSessionUiReducer(
      INITIAL_QUESTION_SESSION_UI_STATE,
      { type: "submitFetchStarted" },
    );
    const settledState = questionSessionUiReducer(submittingState, {
      type: "submitFetchFinished",
    });

    expect(submittingState.isSubmitting).toBe(true);
    expect(settledState.isSubmitting).toBe(false);
  });

  it("marks submission", () => {
    const nextState = questionSessionUiReducer(
      INITIAL_QUESTION_SESSION_UI_STATE,
      { type: "submissionMarked" },
    );

    expect(nextState.hasSubmitted).toBe(true);
  });
});
