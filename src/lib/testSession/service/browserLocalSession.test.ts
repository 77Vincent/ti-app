import { QUESTION_TYPES } from "@/lib/meta";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Question } from "@/lib/validation/question";
import { localTestSessionService } from "./browserLocalSession";

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
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));

    expect(localTestSessionService.readLocalTestSessionQuestionState("session-1")).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 0,
    });
  });

  it("moves cursor backward and forward within bounds", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q2"));

    const previous = localTestSessionService.shiftLocalTestSessionQuestion("session-1", -1);
    expect(previous).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 0,
    });

    const next = localTestSessionService.shiftLocalTestSessionQuestion("session-1", 1);
    expect(next).toEqual({
      question: expect.objectContaining({ id: "q2" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 1,
    });
  });

  it("persists selected options and submitted status per question", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));
    localTestSessionService.writeLocalTestSessionQuestionSelection("session-1", ["A", "C"]);
    localTestSessionService.markLocalTestSessionQuestionSubmitted("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q2"));

    const q1 = localTestSessionService.shiftLocalTestSessionQuestion("session-1", -1);
    expect(q1).toEqual({
      question: expect.objectContaining({ id: "q1" }),
      selectedOptionIds: ["A", "C"],
      hasSubmitted: true,
      currentQuestionIndex: 0,
    });

    const q2 = localTestSessionService.shiftLocalTestSessionQuestion("session-1", 1);
    expect(q2).toEqual({
      question: expect.objectContaining({ id: "q2" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 1,
    });
  });

  it("reads real-time accuracy for current session", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));
    localTestSessionService.writeLocalTestSessionQuestionSelection("session-1", ["A"]);
    localTestSessionService.markLocalTestSessionQuestionSubmitted("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q2"));
    localTestSessionService.writeLocalTestSessionQuestionSelection("session-1", ["B"]);
    localTestSessionService.markLocalTestSessionQuestionSubmitted("session-1");

    expect(localTestSessionService.readLocalTestSessionAccuracy("session-1")).toEqual({
      submittedCount: 2,
      correctCount: 1,
    });
    expect(localTestSessionService.readLocalTestSessionAccuracy("session-2")).toBeNull();

    expect(localTestSessionService.readLocalTestSessionProgress("session-1")).toEqual({
      currentQuestionIndex: 1,
      submittedCount: 2,
      correctCount: 1,
    });
    expect(localTestSessionService.readLocalTestSessionProgress("session-2")).toBeNull();
  });

  it("does not move cursor out of bounds or across mismatched sessions", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q2"));

    expect(localTestSessionService.shiftLocalTestSessionQuestion("session-1", 1)).toBeNull();
    expect(localTestSessionService.shiftLocalTestSessionQuestion("session-2", -1)).toBeNull();
    expect(localTestSessionService.readLocalTestSessionQuestionState("session-2")).toBeNull();
  });

  it("clears local session state", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));

    localTestSessionService.clearLocalTestSession();

    expect(localTestSessionService.readLocalTestSessionQuestionState("session-1")).toBeNull();
  });

  it("enqueues and consumes queued questions for the same session", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.writeLocalTestSessionQuestion(createQuestion("q1"));

    expect(
      localTestSessionService.enqueueLocalTestSessionQuestion("session-1", createQuestion("q2")),
    ).toBe(true);
    expect(localTestSessionService.countLocalTestSessionQueuedQuestions("session-1")).toBe(1);

    const consumed = localTestSessionService.consumeLocalTestSessionQueuedQuestion("session-1");
    expect(consumed).toEqual({
      question: expect.objectContaining({ id: "q2" }),
      selectedOptionIds: [],
      hasSubmitted: false,
      currentQuestionIndex: 1,
    });
    expect(localTestSessionService.countLocalTestSessionQueuedQuestions("session-1")).toBe(0);
  });
});
