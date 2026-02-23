export type SubmitQuestionInput = {
  hasSubmitted: boolean;
  isCurrentAnswerCorrect: boolean;
  recordQuestionResult: (isCorrect: boolean) => Promise<void>;
  onSubmitRequestStarted: () => void;
  onSubmitRequestFinished: () => void;
  isQuestionLimitError: (error: unknown) => boolean;
  onQuestionLimitReached: () => void;
  onError: (error: unknown) => void;
  onSubmissionMarked: () => void;
  persistSubmission: () => void;
  onNextQuestionLoadStarted: () => void;
  onNextQuestionLoadFinished: () => void;
  advanceToNextQuestion: () => Promise<void>;
};

export async function submitQuestion({
  hasSubmitted,
  isCurrentAnswerCorrect,
  recordQuestionResult,
  onSubmitRequestStarted,
  onSubmitRequestFinished,
  isQuestionLimitError,
  onQuestionLimitReached,
  onError,
  onSubmissionMarked,
  persistSubmission,
  onNextQuestionLoadStarted,
  onNextQuestionLoadFinished,
  advanceToNextQuestion,
}: SubmitQuestionInput): Promise<void> {
  if (!hasSubmitted) {
    onSubmissionMarked();
    onSubmitRequestStarted();
    try {
      await recordQuestionResult(isCurrentAnswerCorrect);
    } catch (error) {
      if (isQuestionLimitError(error)) {
        onQuestionLimitReached();
        return;
      }

      onError(error);
      return;
    } finally {
      onSubmitRequestFinished();
    }

    persistSubmission();
    return;
  }

  onNextQuestionLoadStarted();
  try {
    await advanceToNextQuestion();
  } finally {
    onNextQuestionLoadFinished();
  }
}
