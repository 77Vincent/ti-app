import { describe, expect, it, vi } from "vitest";
import {
  createQuestionQueueReplenisher,
  type LoadedQuestions,
} from "./questionQueueReplenisher";

describe("questionQueueReplenisher", () => {
  it("replenishes queue after a consume event when inventory is below threshold", async () => {
    const loadedQuestions: LoadedQuestions<string> = {
      question: "Q1",
      nextQuestion: "Q2",
    };
    const countQueuedQuestions = vi
      .fn<(sessionId: string) => number>()
      .mockReturnValue(2)
      .mockReturnValueOnce(0);
    const enqueueQuestion = vi
      .fn<(sessionId: string, question: string) => boolean>()
      .mockReturnValue(true);
    const loadQuestions = vi.fn(async () => loadedQuestions);

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions,
      enqueueQuestion,
      countQueuedQuestions,
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadQuestions).toHaveBeenCalledTimes(1);
    expect(enqueueQuestion).toHaveBeenCalledWith("session-1", "Q1");
    expect(enqueueQuestion).toHaveBeenCalledWith("session-1", "Q2");
  });

  it("does only one replenish fetch per consume event", async () => {
    const loadQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions,
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 0),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadQuestions).toHaveBeenCalledTimes(1);
  });

  it("does not fetch when queue is already at threshold", async () => {
    const loadQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions,
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 2),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadQuestions).not.toHaveBeenCalled();
  });

  it("ignores consume events after clear", async () => {
    const loadQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions,
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 0),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    provider.clear();
    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadQuestions).not.toHaveBeenCalled();
  });

  it("forwards replenish fetch errors to onError", async () => {
    const loadError = new Error("load failed");
    const onError = vi.fn();

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions: vi.fn<() => Promise<LoadedQuestions<string>>>().mockRejectedValue(loadError),
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 0),
      onError,
      minQueuedQuestions: 2,
    });

    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(onError).toHaveBeenCalledWith(loadError);
  });

  it("prevents overlapping replenish loops", async () => {
    const loadedQuestions: LoadedQuestions<string> = {
      question: "Q1",
      nextQuestion: "Q2",
    };
    const countQueuedQuestions = vi
      .fn<(sessionId: string) => number>()
      .mockReturnValue(2)
      .mockReturnValueOnce(0);
    const loadQuestions = vi.fn(async () => loadedQuestions);

    const provider = createQuestionQueueReplenisher({
      sessionId: "session-1",
      loadQuestions,
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions,
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.onQuestionConsumed();
    await provider.onQuestionConsumed();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadQuestions).toHaveBeenCalledTimes(1);
  });
});
