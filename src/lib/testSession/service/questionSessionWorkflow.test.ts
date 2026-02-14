import { describe, expect, it, vi } from "vitest";
import {
  advanceQuestionSession,
  initializeQuestionSessionState,
} from "./questionSessionWorkflow";

describe("questionSessionWorkflow", () => {
  describe("initializeQuestionSessionState", () => {
    it("restores current question and skips initial load", async () => {
      const restoreCurrentQuestion = vi.fn(() => true);
      const loadInitialQuestions = vi.fn(async () => ({
        question: "Q1",
        nextQuestion: "Q2",
      }));

      await initializeQuestionSessionState({
        restoreCurrentQuestion,
        loadInitialQuestions,
        pushLoadedQuestion: vi.fn(() => true),
        enqueueQuestion: vi.fn(() => true),
        onError: vi.fn(),
      });

      expect(restoreCurrentQuestion).toHaveBeenCalledTimes(1);
      expect(loadInitialQuestions).not.toHaveBeenCalled();
    });

    it("loads initial questions and applies current + enqueues next", async () => {
      const pushLoadedQuestion = vi.fn(() => true);
      const enqueueQuestion = vi.fn(() => true);

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestions: async () => ({
          question: "Q1",
          nextQuestion: "Q2",
        }),
        pushLoadedQuestion,
        enqueueQuestion,
        onError: vi.fn(),
      });

      expect(pushLoadedQuestion).toHaveBeenCalledWith("Q1");
      expect(enqueueQuestion).toHaveBeenCalledWith("Q2");
    });

    it("forwards load errors", async () => {
      const error = new Error("load failed");
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestions: vi.fn<() => Promise<{ question: string; nextQuestion: string }>>()
          .mockRejectedValue(error),
        pushLoadedQuestion: vi.fn(() => true),
        enqueueQuestion: vi.fn(() => true),
        onError,
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it("forwards apply failures", async () => {
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestions: async () => ({
          question: "Q1",
          nextQuestion: "Q2",
        }),
        pushLoadedQuestion: vi.fn(() => false),
        enqueueQuestion: vi.fn(() => true),
        onError,
      });

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("ignores success result when shouldIgnoreResult is true", async () => {
      const pushLoadedQuestion = vi.fn(() => true);
      const enqueueQuestion = vi.fn(() => true);
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestions: async () => ({
          question: "Q1",
          nextQuestion: "Q2",
        }),
        pushLoadedQuestion,
        enqueueQuestion,
        onError,
        shouldIgnoreResult: () => true,
      });

      expect(pushLoadedQuestion).not.toHaveBeenCalled();
      expect(enqueueQuestion).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("ignores error result when shouldIgnoreResult is true", async () => {
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestions: vi.fn<() => Promise<{ question: string; nextQuestion: string }>>()
          .mockRejectedValue(new Error("x")),
        pushLoadedQuestion: vi.fn(() => true),
        enqueueQuestion: vi.fn(() => true),
        onError,
        shouldIgnoreResult: () => true,
      });

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("advanceQuestionSession", () => {
    it("consumes and notifies queue provider", async () => {
      const onQuestionConsumed = vi.fn(async () => undefined);

      await advanceQuestionSession({
        consumeNextQuestion: () => true,
        onQuestionConsumed,
      });

      expect(onQuestionConsumed).toHaveBeenCalledTimes(1);
    });

    it("does nothing when consume fails", async () => {
      const onQuestionConsumed = vi.fn(async () => undefined);

      await advanceQuestionSession({
        consumeNextQuestion: () => false,
        onQuestionConsumed,
      });

      expect(onQuestionConsumed).not.toHaveBeenCalled();
    });

    it("does nothing when shouldIgnoreResult is true", async () => {
      const onQuestionConsumed = vi.fn(async () => undefined);
      const consumeNextQuestion = vi.fn(() => true);

      await advanceQuestionSession({
        consumeNextQuestion,
        onQuestionConsumed,
        shouldIgnoreResult: () => true,
      });

      expect(consumeNextQuestion).not.toHaveBeenCalled();
      expect(onQuestionConsumed).not.toHaveBeenCalled();
    });
  });
});
