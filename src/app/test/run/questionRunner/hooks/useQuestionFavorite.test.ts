import type { Question } from "../types";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    useRef<T>(initialValue: T): { current: T } {
      const [, ref] = readSlot(() => ({ current: initialValue }));
      return ref as { current: T };
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

const { toggleQuestionFavorite } = vi.hoisted(() => ({
  toggleQuestionFavorite: vi.fn(),
}));

const { readFavoriteQuestionState } = vi.hoisted(() => ({
  readFavoriteQuestionState: vi.fn(),
}));

const { toastError } = vi.hoisted(() => ({
  toastError: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: react.useCallback,
  useRef: react.useRef,
  useState: react.useState,
}));

vi.mock("../service/favorite", () => ({
  toggleQuestionFavorite,
}));

vi.mock("../api", () => ({
  readFavoriteQuestionState,
}));

vi.mock("@/lib/toast", () => ({
  toast: {
    error: toastError,
  },
}));

import { useQuestionFavorite } from "./useQuestionFavorite";

const QUESTION: Question = {
  id: "q-1",
  prompt: "Prompt",
  difficulty: "A1",
  options: [
    { text: "Option A", explanation: "A" },
    { text: "Option B", explanation: "B" },
    { text: "Option C", explanation: "C" },
    { text: "Option D", explanation: "D" },
  ],
  correctOptionIndexes: [0],
};

function useQuestionFavoriteHarness(onAuthRequired = vi.fn()) {
  react.beginRender();
  return useQuestionFavorite({
    onAuthRequired,
  });
}

describe("useQuestionFavorite", () => {
  afterEach(() => {
    vi.resetAllMocks();
    react.reset();
  });

  it("sets favorite on success", async () => {
    readFavoriteQuestionState.mockResolvedValueOnce(false);
    toggleQuestionFavorite.mockResolvedValueOnce({
      type: "success",
      isFavorite: true,
    });

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);

    await hook.toggleFavorite(QUESTION);

    const nextHook = useQuestionFavoriteHarness();
    expect(nextHook.isFavorite).toBe(true);
    expect(toastError).not.toHaveBeenCalled();
  });

  it("triggers auth callback on auth_required result", async () => {
    readFavoriteQuestionState.mockResolvedValueOnce(false);
    toggleQuestionFavorite.mockResolvedValueOnce({ type: "auth_required" });

    const onAuthRequired = vi.fn();
    const hook = useQuestionFavoriteHarness(onAuthRequired);
    await hook.syncFavoriteState(QUESTION);

    await hook.toggleFavorite(QUESTION);

    expect(onAuthRequired).toHaveBeenCalledTimes(1);
  });

  it("shows toast on error result", async () => {
    const error = new Error("boom");
    readFavoriteQuestionState.mockResolvedValueOnce(false);
    toggleQuestionFavorite.mockResolvedValueOnce({ type: "error", error });

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);

    await hook.toggleFavorite(QUESTION);

    expect(toastError).toHaveBeenCalledWith(error, {
      fallbackDescription: "Failed to favorite question.",
    });
  });

  it("ignores stale mutation results", async () => {
    readFavoriteQuestionState.mockResolvedValue(false);
    let resolveFirst!: (value: unknown) => void;
    toggleQuestionFavorite.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);

    const firstToggle = hook.toggleFavorite(QUESTION);
    await hook.syncFavoriteState({ ...QUESTION, id: "q-2" });

    resolveFirst({ type: "success", isFavorite: true });
    await firstToggle;

    const nextHook = useQuestionFavoriteHarness();
    expect(nextHook.isFavorite).toBe(false);
  });

  it("loads favorite state for active question", async () => {
    readFavoriteQuestionState.mockResolvedValueOnce(true);

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);

    const nextHook = useQuestionFavoriteHarness();
    expect(nextHook.isFavorite).toBe(true);
  });

  it("uses cached favorite state for previously synced question", async () => {
    readFavoriteQuestionState.mockResolvedValueOnce(true);

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);
    await hook.syncFavoriteState(QUESTION);

    expect(readFavoriteQuestionState).toHaveBeenCalledTimes(1);

    const nextHook = useQuestionFavoriteHarness();
    expect(nextHook.isFavorite).toBe(true);
  });

  it("uses cached toggled state without refetch", async () => {
    readFavoriteQuestionState.mockResolvedValueOnce(false);
    toggleQuestionFavorite.mockResolvedValueOnce({
      type: "success",
      isFavorite: true,
    });

    const hook = useQuestionFavoriteHarness();
    await hook.syncFavoriteState(QUESTION);
    await hook.toggleFavorite(QUESTION);
    await hook.syncFavoriteState(QUESTION);

    expect(readFavoriteQuestionState).toHaveBeenCalledTimes(1);

    const nextHook = useQuestionFavoriteHarness();
    expect(nextHook.isFavorite).toBe(true);
  });
});
