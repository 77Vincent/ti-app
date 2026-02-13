import { describe, expect, it, vi } from "vitest";
import { submitQuestion } from "./questionSubmit";

describe("submitQuestion", () => {
  it("marks submission and persists when quota consume succeeds", async () => {
    const recordQuestionResult = vi
      .fn<(isCorrect: boolean) => Promise<void>>()
      .mockResolvedValueOnce(undefined);
    const onSubmissionMarked = vi.fn();
    const persistSubmission = vi.fn();

    await submitQuestion({
      hasSubmitted: false,
      isCurrentAnswerCorrect: true,
      recordQuestionResult,
      isQuestionLimitError: () => false,
      onQuestionLimitReached: vi.fn(),
      onError: vi.fn(),
      onSubmissionMarked,
      persistSubmission,
      goToNextQuestion: vi.fn(() => false),
      onNextQuestionLoadStarted: vi.fn(),
      onNextQuestionLoadFinished: vi.fn(),
      loadNextQuestion: vi.fn(async () => undefined),
    });

    expect(recordQuestionResult).toHaveBeenCalledWith(true);
    expect(onSubmissionMarked).toHaveBeenCalledTimes(1);
    expect(persistSubmission).toHaveBeenCalledTimes(1);
  });

  it("requests sign-in when quota limit is reached", async () => {
    const limitError = new Error("limit");
    const onQuestionLimitReached = vi.fn();
    const onError = vi.fn();

    await submitQuestion({
      hasSubmitted: false,
      isCurrentAnswerCorrect: false,
      recordQuestionResult: vi
        .fn<(isCorrect: boolean) => Promise<void>>()
        .mockRejectedValueOnce(limitError),
      isQuestionLimitError: (error) => error === limitError,
      onQuestionLimitReached,
      onError,
      onSubmissionMarked: vi.fn(),
      persistSubmission: vi.fn(),
      goToNextQuestion: vi.fn(() => false),
      onNextQuestionLoadStarted: vi.fn(),
      onNextQuestionLoadFinished: vi.fn(),
      loadNextQuestion: vi.fn(async () => undefined),
    });

    expect(onQuestionLimitReached).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("forwards non-limit errors", async () => {
    const requestError = new Error("request");
    const onError = vi.fn();

    await submitQuestion({
      hasSubmitted: false,
      isCurrentAnswerCorrect: false,
      recordQuestionResult: vi
        .fn<(isCorrect: boolean) => Promise<void>>()
        .mockRejectedValueOnce(requestError),
      isQuestionLimitError: () => false,
      onQuestionLimitReached: vi.fn(),
      onError,
      onSubmissionMarked: vi.fn(),
      persistSubmission: vi.fn(),
      goToNextQuestion: vi.fn(() => false),
      onNextQuestionLoadStarted: vi.fn(),
      onNextQuestionLoadFinished: vi.fn(),
      loadNextQuestion: vi.fn(async () => undefined),
    });

    expect(onError).toHaveBeenCalledWith(requestError);
  });

  it("does nothing when next question is already available", async () => {
    const onNextQuestionLoadStarted = vi.fn();
    const onNextQuestionLoadFinished = vi.fn();
    const loadNextQuestion = vi.fn(async () => undefined);

    await submitQuestion({
      hasSubmitted: true,
      isCurrentAnswerCorrect: false,
      recordQuestionResult: vi.fn(async () => undefined),
      isQuestionLimitError: () => false,
      onQuestionLimitReached: vi.fn(),
      onError: vi.fn(),
      onSubmissionMarked: vi.fn(),
      persistSubmission: vi.fn(),
      goToNextQuestion: vi.fn(() => true),
      onNextQuestionLoadStarted,
      onNextQuestionLoadFinished,
      loadNextQuestion,
    });

    expect(onNextQuestionLoadStarted).not.toHaveBeenCalled();
    expect(loadNextQuestion).not.toHaveBeenCalled();
    expect(onNextQuestionLoadFinished).not.toHaveBeenCalled();
  });

  it("loads next question when needed and always finishes loading state", async () => {
    const onNextQuestionLoadStarted = vi.fn();
    const onNextQuestionLoadFinished = vi.fn();
    const loadNextQuestion = vi.fn<() => Promise<void>>().mockResolvedValueOnce(undefined);

    await submitQuestion({
      hasSubmitted: true,
      isCurrentAnswerCorrect: false,
      recordQuestionResult: vi.fn(async () => undefined),
      isQuestionLimitError: () => false,
      onQuestionLimitReached: vi.fn(),
      onError: vi.fn(),
      onSubmissionMarked: vi.fn(),
      persistSubmission: vi.fn(),
      goToNextQuestion: vi.fn(() => false),
      onNextQuestionLoadStarted,
      onNextQuestionLoadFinished,
      loadNextQuestion,
    });

    expect(onNextQuestionLoadStarted).toHaveBeenCalledTimes(1);
    expect(loadNextQuestion).toHaveBeenCalledTimes(1);
    expect(onNextQuestionLoadFinished).toHaveBeenCalledTimes(1);
  });

  it("still finishes loading state when next-question load fails", async () => {
    const onNextQuestionLoadFinished = vi.fn();
    const loadError = new Error("load failed");

    await expect(
      submitQuestion({
        hasSubmitted: true,
        isCurrentAnswerCorrect: false,
        recordQuestionResult: vi.fn(async () => undefined),
        isQuestionLimitError: () => false,
        onQuestionLimitReached: vi.fn(),
        onError: vi.fn(),
        onSubmissionMarked: vi.fn(),
        persistSubmission: vi.fn(),
        goToNextQuestion: vi.fn(() => false),
        onNextQuestionLoadStarted: vi.fn(),
        onNextQuestionLoadFinished,
        loadNextQuestion: vi.fn<() => Promise<void>>().mockRejectedValueOnce(loadError),
      }),
    ).rejects.toThrow(loadError);

    expect(onNextQuestionLoadFinished).toHaveBeenCalledTimes(1);
  });
});
