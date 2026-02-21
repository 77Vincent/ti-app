import type { LocalTestSessionQuestionState } from "@/lib/testSession/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Question } from "../types";

const react = vi.hoisted(() => {
  return {
    useCallback<T extends (...args: never[]) => unknown>(callback: T): T {
      return callback;
    },
  };
});

const session = vi.hoisted(() => ({
  markLocalTestSessionQuestionSubmitted: vi.fn(),
  readLocalTestSessionQuestionState: vi.fn(),
  writeLocalTestSessionQuestion: vi.fn(),
  writeLocalTestSessionQuestionSelection: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: react.useCallback,
}));

vi.mock("@/lib/testSession/service/browserLocalSession", () => ({
  localTestSessionService: session,
}));

import { useQuestionHistory } from "./useQuestionHistory";

const QUESTION = {
  id: "q-1",
  questionType: "multiple_choice",
  prompt: "Prompt",
  options: [],
  correctOptionIds: ["A"],
} as unknown as Question;

const QUESTION_STATE: LocalTestSessionQuestionState = {
  question: QUESTION,
  selectedOptionIds: ["A"],
  hasSubmitted: true,
  currentQuestionIndex: 1,
};

function useQuestionHistoryHarness(onQuestionStateApplied = vi.fn(), onQuestionApplied = vi.fn()) {
  return useQuestionHistory({
    sessionId: "session-1",
    onQuestionStateApplied,
    onQuestionApplied,
  });
}

describe("useQuestionHistory", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("restores current question and updates callbacks", () => {
    session.readLocalTestSessionQuestionState.mockReturnValueOnce(QUESTION_STATE);
    const onQuestionStateApplied = vi.fn();
    const onQuestionApplied = vi.fn();

    const hook = useQuestionHistoryHarness(onQuestionStateApplied, onQuestionApplied);
    expect(hook.restoreCurrentQuestion()).toBe(true);

    expect(onQuestionStateApplied).toHaveBeenCalledWith(QUESTION_STATE);
    expect(onQuestionApplied).toHaveBeenCalledTimes(1);
  });

  it("returns false when restoring/loading question state fails", () => {
    session.readLocalTestSessionQuestionState.mockReturnValueOnce(null);
    session.writeLocalTestSessionQuestion.mockReturnValueOnce(null);

    const hook = useQuestionHistoryHarness();
    expect(hook.restoreCurrentQuestion()).toBe(false);
    expect(hook.pushLoadedQuestion(QUESTION)).toBe(false);
  });

  it("persists selection and submission", () => {
    const hook = useQuestionHistoryHarness();

    hook.persistSelection(["A", "B"]);
    hook.persistSubmission();

    expect(session.writeLocalTestSessionQuestionSelection).toHaveBeenCalledWith(
      "session-1",
      ["A", "B"],
    );
    expect(session.markLocalTestSessionQuestionSubmitted).toHaveBeenCalledWith(
      "session-1",
    );
  });
});
