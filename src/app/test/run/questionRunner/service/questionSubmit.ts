export type SubmitQuestionInput = {
  hasSubmitted: boolean;
  consumeQuestionQuota: () => Promise<void>;
  isQuestionLimitError: (error: unknown) => boolean;
  onQuestionLimitReached: () => void;
  onError: (error: unknown) => void;
  onSubmissionMarked: () => void;
  persistSubmission: () => void;
  goToNextQuestion: () => boolean;
  onNextQuestionLoadStarted: () => void;
  onNextQuestionLoadFinished: () => void;
  loadNextQuestion: () => Promise<void>;
};

export async function submitQuestion({
  hasSubmitted,
  consumeQuestionQuota,
  isQuestionLimitError,
  onQuestionLimitReached,
  onError,
  onSubmissionMarked,
  persistSubmission,
  goToNextQuestion,
  onNextQuestionLoadStarted,
  onNextQuestionLoadFinished,
  loadNextQuestion,
}: SubmitQuestionInput): Promise<void> {
  if (!hasSubmitted) {
    try {
      await consumeQuestionQuota();
    } catch (error) {
      if (isQuestionLimitError(error)) {
        onQuestionLimitReached();
        return;
      }

      onError(error);
      return;
    }

    onSubmissionMarked();
    persistSubmission();
    return;
  }

  if (goToNextQuestion()) {
    return;
  }

  onNextQuestionLoadStarted();
  try {
    await loadNextQuestion();
  } finally {
    onNextQuestionLoadFinished();
  }
}
