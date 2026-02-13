import { QUESTION_TYPES } from "@/lib/meta";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Question } from "../../types";
import {
  clearLocalTestSession,
  markLocalTestSessionQuestionSubmitted,
  readLocalTestSessionAccuracy,
  readLocalTestSessionProgress,
  readLocalTestSessionQuestionState,
  shiftLocalTestSessionQuestion,
  writeLocalTestSessionQuestionSelection,
  writeLocalTestSession,
  writeLocalTestSessionQuestion,
} from "./index";

function createQuestion(id: string): Question {
  return {
    id,
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: `Prompt ${id}`,
    options: [
      { id: "A", text: "A", explanation: "A" },
      { id: "B", text: "B", explanation: "B" },
      { id: "C", text: "C", explanation: "C" },
      { id: "D", text: "D", explanation: "D" },
    ],
    correctOptionIds: ["A"],
  };
}

function createLocalStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
  };
}

describe("local test session", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "window",
      { localStorage: createLocalStorage() } as unknown as Window & typeof globalThis,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads current question state for matching session", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));

    expect(readLocalTestSessionQuestionState("session-1")).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 0,
    });
  });

  it("moves cursor backward and forward within bounds", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));
    writeLocalTestSessionQuestion(createQuestion("q2"));

    const previous = shiftLocalTestSessionQuestion("session-1", -1);
    expect(previous).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 0,
    });

    const next = shiftLocalTestSessionQuestion("session-1", 1);
    expect(next).toEqual({
      question: expect.objectContaining({ id: "q2" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 1,
    });
  });

  it("persists selected options and submitted status per question", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));
    writeLocalTestSessionQuestionSelection("session-1", ["A", "C"]);
    markLocalTestSessionQuestionSubmitted("session-1");
    writeLocalTestSessionQuestion(createQuestion("q2"));

    const q1 = shiftLocalTestSessionQuestion("session-1", -1);
    expect(q1).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: ["A", "C"],
      hasSubmitted: true,
      currentQuestionIndex: 0,
    });

    const q2 = shiftLocalTestSessionQuestion("session-1", 1);
    expect(q2).toEqual({
      question: expect.objectContaining({ id: "q2" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 1,
    });
  });

  it("reads real-time accuracy for current session", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));
    writeLocalTestSessionQuestionSelection("session-1", ["A"]);
    markLocalTestSessionQuestionSubmitted("session-1");
    writeLocalTestSessionQuestion(createQuestion("q2"));
    writeLocalTestSessionQuestionSelection("session-1", ["B"]);
    markLocalTestSessionQuestionSubmitted("session-1");

    expect(readLocalTestSessionAccuracy("session-1")).toEqual({
      submittedCount: 2,
      correctCount: 1,
    });
    expect(readLocalTestSessionAccuracy("session-2")).toBeNull();

    expect(readLocalTestSessionProgress("session-1")).toEqual({
      currentQuestionIndex: 1,
      submittedCount: 2,
      correctCount: 1,
    });
    expect(readLocalTestSessionProgress("session-2")).toBeNull();
  });

  it("does not move cursor out of bounds or across mismatched sessions", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));
    writeLocalTestSessionQuestion(createQuestion("q2"));

    expect(shiftLocalTestSessionQuestion("session-1", 1)).toBeNull();
    expect(shiftLocalTestSessionQuestion("session-2", -1)).toBeNull();
    expect(readLocalTestSessionQuestionState("session-2")).toBeNull();
  });

  it("clears local session state", () => {
    writeLocalTestSession("session-1");
    writeLocalTestSessionQuestion(createQuestion("q1"));

    clearLocalTestSession();

    expect(readLocalTestSessionQuestionState("session-1")).toBeNull();
  });
});
