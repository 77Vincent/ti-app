type ShouldIgnoreResult = () => boolean;

export type InitializeQuestionSessionStateInput<T> = {
  restoreCurrentQuestion: () => boolean;
  loadInitialQuestion: () => Promise<T>;
  pushLoadedQuestion: (question: T) => boolean;
  onError: (error: unknown) => void;
  shouldIgnoreResult?: ShouldIgnoreResult;
};

export async function initializeQuestionSessionState<T>({
  restoreCurrentQuestion,
  loadInitialQuestion,
  pushLoadedQuestion,
  onError,
  shouldIgnoreResult,
}: InitializeQuestionSessionStateInput<T>): Promise<void> {
  if (restoreCurrentQuestion()) {
    return;
  }

  try {
    const loadedQuestion = await loadInitialQuestion();
    if (shouldIgnoreResult?.()) {
      return;
    }

    const applied = pushLoadedQuestion(loadedQuestion);
    if (!applied) {
      throw new Error("Failed to persist question in local session.");
    }
  } catch (error) {
    if (shouldIgnoreResult?.()) {
      return;
    }

    onError(error);
  }
}

export type AdvanceQuestionSessionInput<T> = {
  loadNextQuestion: () => Promise<T>;
  pushLoadedQuestion: (question: T) => boolean;
  onError: (error: unknown) => void;
  shouldIgnoreResult?: ShouldIgnoreResult;
};

export async function advanceQuestionSession<T>({
  loadNextQuestion,
  pushLoadedQuestion,
  onError,
  shouldIgnoreResult,
}: AdvanceQuestionSessionInput<T>): Promise<void> {
  if (shouldIgnoreResult?.()) {
    return;
  }

  try {
    const loadedQuestion = await loadNextQuestion();
    if (shouldIgnoreResult?.()) {
      return;
    }

    const applied = pushLoadedQuestion(loadedQuestion);
    if (!applied) {
      throw new Error("Failed to persist question in local session.");
    }
  } catch (error) {
    if (shouldIgnoreResult?.()) {
      return;
    }

    onError(error);
  }
}
