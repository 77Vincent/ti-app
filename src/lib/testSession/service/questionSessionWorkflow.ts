type ShouldIgnoreResult = () => boolean;

export type LoadedQuestions<T> = {
  question: T;
  nextQuestion: T;
};

export type InitializeQuestionSessionStateInput<T> = {
  restoreCurrentQuestion: () => boolean;
  loadInitialQuestions: () => Promise<LoadedQuestions<T>>;
  pushLoadedQuestion: (question: T) => boolean;
  enqueueQuestion: (question: T) => boolean;
  onError: (error: unknown) => void;
  shouldIgnoreResult?: ShouldIgnoreResult;
};

export async function initializeQuestionSessionState<T>({
  restoreCurrentQuestion,
  loadInitialQuestions,
  pushLoadedQuestion,
  enqueueQuestion,
  onError,
  shouldIgnoreResult,
}: InitializeQuestionSessionStateInput<T>): Promise<void> {
  if (restoreCurrentQuestion()) {
    return;
  }

  try {
    const loadedQuestions = await loadInitialQuestions();
    if (shouldIgnoreResult?.()) {
      return;
    }

    const applied = pushLoadedQuestion(loadedQuestions.question);
    if (!applied) {
      throw new Error("Failed to persist question in local session.");
    }

    enqueueQuestion(loadedQuestions.nextQuestion);
  } catch (error) {
    if (shouldIgnoreResult?.()) {
      return;
    }

    onError(error);
  }
}

export type AdvanceQuestionSessionInput = {
  consumeNextQuestion: () => boolean;
  onQuestionConsumed: (shouldIgnoreResult?: ShouldIgnoreResult) => Promise<void>;
  shouldIgnoreResult?: ShouldIgnoreResult;
};

export async function advanceQuestionSession({
  consumeNextQuestion,
  onQuestionConsumed,
  shouldIgnoreResult,
}: AdvanceQuestionSessionInput): Promise<void> {
  if (shouldIgnoreResult?.()) {
    return;
  }

  const consumed = consumeNextQuestion();
  if (!consumed || shouldIgnoreResult?.()) {
    return;
  }

  await onQuestionConsumed(shouldIgnoreResult);
}
