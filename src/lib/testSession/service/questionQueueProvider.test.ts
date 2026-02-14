import { describe, expect, it, vi } from "vitest";
import {
  createQuestionQueueProvider,
  type LoadedQuestions,
} from "./questionQueueProvider";

describe("questionQueueProvider", () => {
  it("initializes by loading questions and applying first + enqueuing second", async () => {
    const loadedQuestions: LoadedQuestions<string> = { question: "Q1", nextQuestion: "Q2" };
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>().mockReturnValue(true);
    const enqueueQuestion = vi.fn<(sessionId: string, question: string) => boolean>().mockReturnValue(true);

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions: vi.fn(async () => loadedQuestions),
      loadNextQuestions: vi.fn(async () => loadedQuestions),
      pushLoadedQuestion,
      enqueueQuestion,
      countQueuedQuestions: vi.fn(() => 1),
      hasCurrentQuestion: vi.fn(() => true),
      onError: vi.fn(),
      minQueuedQuestions: 1,
    });

    await provider.initialize();

    expect(pushLoadedQuestion).toHaveBeenCalledWith("Q1");
    expect(enqueueQuestion).toHaveBeenCalledWith("session-1", "Q2");
  });

  it("initialization does not trigger replenish", async () => {
    const loadedQuestions: LoadedQuestions<string> = { question: "Q1", nextQuestion: "Q2" };
    const loadNextQuestions = vi.fn(async () => loadedQuestions);

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions: vi.fn(async () => loadedQuestions),
      loadNextQuestions,
      pushLoadedQuestion: vi.fn(() => true),
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 0),
      hasCurrentQuestion: vi.fn(() => true),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.initialize();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadNextQuestions).not.toHaveBeenCalled();
  });

  it("does not replenish when there is no current question", async () => {
    const loadNextQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions: vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" })),
      loadNextQuestions,
      pushLoadedQuestion: vi.fn(() => true),
      consumeNextQuestion: vi.fn(() => true),
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 0),
      hasCurrentQuestion: vi.fn(() => false),
      onError: vi.fn(),
    });

    await provider.requestNextQuestion();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadNextQuestions).not.toHaveBeenCalled();
  });

  it("initializes from restored current question without loading initial questions", async () => {
    const restoreCurrentQuestion = vi.fn(() => true);
    const loadInitialQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));
    const loadNextQuestions = vi.fn(async () => ({ question: "Q1", nextQuestion: "Q2" }));

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions,
      loadNextQuestions,
      pushLoadedQuestion: vi.fn(() => true),
      restoreCurrentQuestion,
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions: vi.fn(() => 2),
      hasCurrentQuestion: vi.fn(() => true),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.initialize();

    expect(restoreCurrentQuestion).toHaveBeenCalledTimes(1);
    expect(loadInitialQuestions).not.toHaveBeenCalled();
    expect(loadNextQuestions).not.toHaveBeenCalled();
  });

  it("requesting next question consumes queue and triggers background replenish", async () => {
    const loadedQuestions: LoadedQuestions<string> = { question: "Q1", nextQuestion: "Q2" };
    const countQueuedQuestions = vi
      .fn<(sessionId: string) => number>()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(2);
    const loadNextQuestions = vi.fn(async () => loadedQuestions);

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions: vi.fn(async () => loadedQuestions),
      loadNextQuestions,
      pushLoadedQuestion: vi.fn(() => true),
      consumeNextQuestion: vi.fn(() => true),
      enqueueQuestion: vi.fn(() => true),
      countQueuedQuestions,
      hasCurrentQuestion: vi.fn(() => true),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.requestNextQuestion();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(loadNextQuestions).toHaveBeenCalledTimes(1);
  });

  it("requesting next question does not fetch when queue is empty", async () => {
    const loadedQuestions: LoadedQuestions<string> = { question: "Q1", nextQuestion: "Q2" };
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>().mockReturnValue(true);
    const enqueueQuestion = vi.fn<(sessionId: string, question: string) => boolean>().mockReturnValue(true);
    const loadNextQuestions = vi.fn(async () => loadedQuestions);

    const provider = createQuestionQueueProvider({
      sessionId: "session-1",
      loadInitialQuestions: vi.fn(async () => loadedQuestions),
      loadNextQuestions,
      pushLoadedQuestion,
      consumeNextQuestion: vi.fn(() => false),
      enqueueQuestion,
      countQueuedQuestions: vi.fn(() => 2),
      hasCurrentQuestion: vi.fn(() => true),
      onError: vi.fn(),
      minQueuedQuestions: 2,
    });

    await provider.requestNextQuestion();

    expect(loadNextQuestions).not.toHaveBeenCalled();
    expect(pushLoadedQuestion).not.toHaveBeenCalled();
    expect(enqueueQuestion).not.toHaveBeenCalled();
  });
});
