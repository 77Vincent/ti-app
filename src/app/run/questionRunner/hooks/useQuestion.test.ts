import type { Question } from "@/lib/question/model";
import type { UseQuestionInput } from "./useQuestion";
import { afterEach, describe, expect, it, vi } from "vitest";

const react = vi.hoisted(() => {
  let slots: unknown[] = [];
  let cursor = 0;
  const pendingEffects: Array<() => void> = [];

  function readSlot<T>(initializer: () => T): [number, T] {
    const index = cursor;
    cursor += 1;

    if (!(index in slots)) {
      slots[index] = initializer();
    }

    return [index, slots[index] as T];
  }

  function depsChanged(
    previous: readonly unknown[] | undefined,
    next: readonly unknown[] | undefined,
  ): boolean {
    if (!previous || !next) {
      return true;
    }
    if (previous.length !== next.length) {
      return true;
    }

    return next.some((value, index) => !Object.is(value, previous[index]));
  }

  return {
    beginRender() {
      cursor = 0;
    },
    flushEffects() {
      while (pendingEffects.length > 0) {
        const runEffect = pendingEffects.shift();
        runEffect?.();
      }
    },
    reset() {
      for (const slot of slots) {
        if (
          slot &&
          typeof slot === "object" &&
          "cleanup" in slot &&
          typeof (slot as { cleanup?: unknown }).cleanup === "function"
        ) {
          (slot as { cleanup: () => void }).cleanup();
        }
      }

      slots = [];
      cursor = 0;
      pendingEffects.length = 0;
    },
    useCallback<T extends (...args: never[]) => unknown>(callback: T): T {
      cursor += 1;
      return callback;
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void {
      const [, effectState] = readSlot(() => ({
        cleanup: undefined as void | (() => void),
        deps: undefined as readonly unknown[] | undefined,
      }));

      if (!depsChanged(effectState.deps, deps)) {
        return;
      }

      pendingEffects.push(() => {
        if (typeof effectState.cleanup === "function") {
          effectState.cleanup();
        }

        effectState.cleanup = effect();
        effectState.deps = deps;
      });
    },
    useReducer<State, Action>(
      reducer: (state: State, action: Action) => State,
      initialState: State,
    ): [State, (action: Action) => void] {
      const [index] = readSlot(() => initialState);

      function dispatch(action: Action) {
        slots[index] = reducer(slots[index] as State, action);
      }

      return [slots[index] as State, dispatch];
    },
    useRef<T>(initialValue: T): { current: T } {
      const [, ref] = readSlot(() => ({ current: initialValue }));
      return ref as { current: T };
    },
    useState<T>(
      initialValue: T | (() => T),
    ): [T, (value: T | ((previous: T) => T)) => void] {
      const [index] = readSlot(() =>
        typeof initialValue === "function"
          ? (initialValue as () => T)()
          : initialValue,
      );

      function setState(value: T | ((previous: T) => T)) {
        const previous = slots[index] as T;
        slots[index] =
          typeof value === "function"
            ? (value as (previous: T) => T)(previous)
            : value;
      }

      return [slots[index] as T, setState];
    },
  };
});

const { fetchQuestion } = vi.hoisted(() => ({
  fetchQuestion: vi.fn(),
}));

const { recordQuestionResult } = vi.hoisted(() => ({
  recordQuestionResult: vi.fn(),
}));

const { notifyUserPlanRefresh } = vi.hoisted(() => ({
  notifyUserPlanRefresh: vi.fn(),
}));

const { toastError } = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: react.useCallback,
  useEffect: react.useEffect,
  useReducer: react.useReducer,
  useRef: react.useRef,
  useState: react.useState,
}));

vi.mock("../api", () => ({
  fetchQuestion,
}));

vi.mock("../session/storage", () => ({
  recordQuestionResult,
}));

vi.mock("@/lib/events/userPlan", () => ({
  notifyUserPlanRefresh,
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: toastError,
  },
}));

import { useQuestion } from "./useQuestion";

const QUESTION_INITIAL: Question = {
  id: "q-initial",
  prompt: "Initial question",
  difficulty: "A1",
  options: [
    { text: "A", explanation: "A" },
    { text: "B", explanation: "B" },
    { text: "C", explanation: "C" },
    { text: "D", explanation: "D" },
  ],
  correctOptionIndexes: [0],
};

const QUESTION_PREFETCHED: Question = {
  id: "q-prefetched",
  prompt: "Prefetched question",
  difficulty: "A1",
  options: [
    { text: "A", explanation: "A" },
    { text: "B", explanation: "B" },
    { text: "C", explanation: "C" },
    { text: "D", explanation: "D" },
  ],
  correctOptionIndexes: [1],
};

const BASE_INPUT: UseQuestionInput = {
  sessionId: "session-1",
  subjectId: "language",
  subcategoryId: "english",
  difficulty: "A1",
  initialCorrectCount: 0,
  initialSubmittedCount: 0,
};

function useQuestionHarness(input: UseQuestionInput = BASE_INPUT) {
  react.beginRender();
  return useQuestion(input);
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

describe("useQuestion", () => {
  afterEach(() => {
    vi.resetAllMocks();
    react.reset();
  });

  it("prefetches the next question after a successful first submission", async () => {
    fetchQuestion.mockResolvedValueOnce(QUESTION_INITIAL);
    fetchQuestion.mockResolvedValueOnce(QUESTION_PREFETCHED);
    recordQuestionResult.mockResolvedValueOnce({
      id: BASE_INPUT.sessionId,
      subjectId: BASE_INPUT.subjectId,
      subcategoryId: BASE_INPUT.subcategoryId,
      difficulty: BASE_INPUT.difficulty,
      submittedCount: 1,
      correctCount: 1,
    });

    useQuestionHarness();
    react.flushEffects();
    await flushMicrotasks();

    const hook = useQuestionHarness();
    const selection = hook.selectOption(0);
    expect(selection).toEqual([0]);

    await hook.submit(selection);
    await flushMicrotasks();

    expect(fetchQuestion).toHaveBeenCalledTimes(2);
    expect(fetchQuestion).toHaveBeenNthCalledWith(1, {
      sessionId: BASE_INPUT.sessionId,
      subjectId: BASE_INPUT.subjectId,
      subcategoryId: BASE_INPUT.subcategoryId,
      difficulty: BASE_INPUT.difficulty,
      next: false,
    });
    expect(fetchQuestion).toHaveBeenNthCalledWith(2, {
      sessionId: BASE_INPUT.sessionId,
      subjectId: BASE_INPUT.subjectId,
      subcategoryId: BASE_INPUT.subcategoryId,
      difficulty: BASE_INPUT.difficulty,
      next: true,
    });
    expect(notifyUserPlanRefresh).toHaveBeenCalledTimes(1);
  });

  it("uses the buffered question on next without an extra fetch", async () => {
    fetchQuestion.mockResolvedValueOnce(QUESTION_INITIAL);
    fetchQuestion.mockResolvedValueOnce(QUESTION_PREFETCHED);
    recordQuestionResult.mockResolvedValueOnce({
      id: BASE_INPUT.sessionId,
      subjectId: BASE_INPUT.subjectId,
      subcategoryId: BASE_INPUT.subcategoryId,
      difficulty: BASE_INPUT.difficulty,
      submittedCount: 1,
      correctCount: 1,
    });

    useQuestionHarness();
    react.flushEffects();
    await flushMicrotasks();

    let hook = useQuestionHarness();
    await hook.submit(hook.selectOption(0));
    await flushMicrotasks();

    hook = useQuestionHarness();
    await hook.submit();
    await flushMicrotasks();

    hook = useQuestionHarness();
    expect(fetchQuestion).toHaveBeenCalledTimes(2);
    expect(hook.question?.id).toBe(QUESTION_PREFETCHED.id);
    expect(hook.hasSubmitted).toBe(false);
  });

  it("does not update local progress or prefetch when submission persistence fails", async () => {
    fetchQuestion.mockResolvedValueOnce(QUESTION_INITIAL);
    recordQuestionResult.mockRejectedValueOnce(new Error("Submit failed"));

    useQuestionHarness();
    react.flushEffects();
    await flushMicrotasks();

    const hook = useQuestionHarness();
    await hook.submit(hook.selectOption(0));
    await flushMicrotasks();

    const nextHook = useQuestionHarness();
    expect(nextHook.submittedCount).toBe(0);
    expect(nextHook.correctCount).toBe(0);
    expect(fetchQuestion).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith(expect.any(Error), {
      fallbackDescription: "Failed to submit answer.",
    });
  });
});
