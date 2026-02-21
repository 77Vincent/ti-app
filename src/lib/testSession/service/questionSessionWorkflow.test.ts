import { describe, expect, it, vi } from "vitest";
import {
  advanceQuestionSession,
  initializeQuestionSessionState,
} from "./questionSessionWorkflow";

describe("questionSessionWorkflow", () => {
  describe("initializeQuestionSessionState", () => {
    it("restores current question and skips initial load", async () => {
      const restoreCurrentQuestion = vi.fn(() => true);
      const loadInitialQuestion = vi.fn(async () => "Q1");

      await initializeQuestionSessionState({
        restoreCurrentQuestion,
        loadInitialQuestion,
        pushLoadedQuestion: vi.fn(() => true),
        onError: vi.fn(),
      });

      expect(restoreCurrentQuestion).toHaveBeenCalledTimes(1);
      expect(loadInitialQuestion).not.toHaveBeenCalled();
    });

    it("loads initial question and applies it", async () => {
      const pushLoadedQuestion = vi.fn(() => true);

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestion: async () => "Q1",
        pushLoadedQuestion,
        onError: vi.fn(),
      });

      expect(pushLoadedQuestion).toHaveBeenCalledWith("Q1");
    });

    it("forwards load errors", async () => {
      const error = new Error("load failed");
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestion: vi.fn<() => Promise<string>>()
          .mockRejectedValue(error),
        pushLoadedQuestion: vi.fn(() => true),
        onError,
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it("forwards apply failures", async () => {
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestion: async () => "Q1",
        pushLoadedQuestion: vi.fn(() => false),
        onError,
      });

      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("ignores success result when shouldIgnoreResult is true", async () => {
      const pushLoadedQuestion = vi.fn(() => true);
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestion: async () => "Q1",
        pushLoadedQuestion,
        onError,
        shouldIgnoreResult: () => true,
      });

      expect(pushLoadedQuestion).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("ignores error result when shouldIgnoreResult is true", async () => {
      const onError = vi.fn();

      await initializeQuestionSessionState({
        restoreCurrentQuestion: () => false,
        loadInitialQuestion: vi.fn<() => Promise<string>>()
          .mockRejectedValue(new Error("x")),
        pushLoadedQuestion: vi.fn(() => true),
        onError,
        shouldIgnoreResult: () => true,
      });

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("advanceQuestionSession", () => {
    it("loads and applies next question", async () => {
      const loadNextQuestion = vi.fn(async () => "Q2");
      const pushLoadedQuestion = vi.fn(() => true);

      await advanceQuestionSession({
        loadNextQuestion,
        pushLoadedQuestion,
        onError: vi.fn(),
      });

      expect(loadNextQuestion).toHaveBeenCalledTimes(1);
      expect(pushLoadedQuestion).toHaveBeenCalledWith("Q2");
    });

    it("does nothing when shouldIgnoreResult is true", async () => {
      const loadNextQuestion = vi.fn(async () => "Q2");
      const pushLoadedQuestion = vi.fn(() => true);

      await advanceQuestionSession({
        loadNextQuestion,
        pushLoadedQuestion,
        onError: vi.fn(),
        shouldIgnoreResult: () => true,
      });

      expect(loadNextQuestion).not.toHaveBeenCalled();
      expect(pushLoadedQuestion).not.toHaveBeenCalled();
    });

    it("forwards load errors", async () => {
      const error = new Error("load failed");
      const onError = vi.fn();

      await advanceQuestionSession({
        loadNextQuestion: vi.fn<() => Promise<string>>().mockRejectedValue(error),
        pushLoadedQuestion: vi.fn(() => true),
        onError,
      });

      expect(onError).toHaveBeenCalledWith(error);
    });

    it("forwards apply failures", async () => {
      const onError = vi.fn();

      await advanceQuestionSession({
        loadNextQuestion: async () => "Q2",
        pushLoadedQuestion: vi.fn(() => false),
        onError,
      });

      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
