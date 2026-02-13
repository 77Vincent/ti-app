import type { LocalTestSessionQuestionState } from "../session";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Question } from "../types";

const react = vi.hoisted(() => {
  let slots: unknown[] = [];
  let cursor = 0;

  function readSlot<T>(initializer: () => T): [number, T] {
    const index = cursor;
    cursor += 1;

    if (!(index in slots)) {
      slots[index] = initializer();
    }

    return [index, slots[index] as T];
  }

  return {
    beginRender() {
      cursor = 0;
    },
    reset() {
      slots = [];
      cursor = 0;
    },
    useCallback<T extends (...args: never[]) => unknown>(callback: T): T {
      cursor += 1;
      return callback;
    },
    useState<T>(initialValue: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void] {
      const [index] = readSlot(() =>
        typeof initialValue === "function"
          ? (initialValue as () => T)()
          : initialValue,
      );

      function setState(value: T | ((prev: T) => T)) {
        const previous = slots[index] as T;
        slots[index] =
          typeof value === "function" ? (value as (prev: T) => T)(previous) : value;
      }

      return [slots[index] as T, setState];
    },
  };
});

const session = vi.hoisted(() => ({
  markLocalTestSessionQuestionSubmitted: vi.fn(),
  readLocalTestSessionQuestionState: vi.fn(),
  shiftLocalTestSessionQuestion: vi.fn(),
  writeLocalTestSessionQuestion: vi.fn(),
  writeLocalTestSessionQuestionSelection: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: react.useCallback,
  useState: react.useState,
}));

vi.mock("../session", () => session);

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
  react.beginRender();
  return useQuestionHistory({
    sessionId: "session-1",
    onQuestionStateApplied,
    onQuestionApplied,
  });
}

describe("useQuestionHistory", () => {
  afterEach(() => {
    vi.resetAllMocks();
    react.reset();
  });

  it("restores current question and updates callbacks/state", () => {
    session.readLocalTestSessionQuestionState.mockReturnValueOnce(QUESTION_STATE);
    const onQuestionStateApplied = vi.fn();
    const onQuestionApplied = vi.fn();

    const hook = useQuestionHistoryHarness(onQuestionStateApplied, onQuestionApplied);
    expect(hook.restoreCurrentQuestion()).toBe(true);

    expect(onQuestionStateApplied).toHaveBeenCalledWith(QUESTION_STATE);
    expect(onQuestionApplied).toHaveBeenCalledTimes(1);

    const nextHook = useQuestionHistoryHarness(onQuestionStateApplied, onQuestionApplied);
    expect(nextHook.canGoToPreviousQuestion).toBe(true);
  });

  it("returns false when restoring/loading question state fails", () => {
    session.readLocalTestSessionQuestionState.mockReturnValueOnce(null);
    session.writeLocalTestSessionQuestion.mockReturnValueOnce(null);

    const hook = useQuestionHistoryHarness();
    expect(hook.restoreCurrentQuestion()).toBe(false);
    expect(hook.pushLoadedQuestion(QUESTION)).toBe(false);
  });

  it("navigates previous/next within local session history", () => {
    session.shiftLocalTestSessionQuestion
      .mockReturnValueOnce(QUESTION_STATE)
      .mockReturnValueOnce(QUESTION_STATE);

    const onQuestionStateApplied = vi.fn();
    const hook = useQuestionHistoryHarness(onQuestionStateApplied);

    expect(hook.goToPreviousQuestion()).toBe(true);
    expect(session.shiftLocalTestSessionQuestion).toHaveBeenNthCalledWith(
      1,
      "session-1",
      -1,
    );
    expect(hook.goToNextQuestion()).toBe(true);
    expect(session.shiftLocalTestSessionQuestion).toHaveBeenNthCalledWith(
      2,
      "session-1",
      1,
    );
    expect(onQuestionStateApplied).toHaveBeenCalledTimes(2);
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
