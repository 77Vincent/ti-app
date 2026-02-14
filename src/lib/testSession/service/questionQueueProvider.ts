import { LOCAL_TEST_SESSION_MIN_QUEUED_QUESTIONS } from "@/lib/config/testPolicy";

export type LoadedQuestions<T> = {
  question: T;
  nextQuestion: T;
};

type LoadQuestions<T> = () => Promise<LoadedQuestions<T>>;
type ShouldIgnoreResult = () => boolean;

export type QuestionQueueProviderInput<T> = {
  sessionId: string;
  loadInitialQuestions: LoadQuestions<T>;
  loadNextQuestions: LoadQuestions<T>;
  pushLoadedQuestion: (question: T) => boolean;
  restoreCurrentQuestion?: () => boolean;
  consumeNextQuestion?: () => boolean;
  enqueueQuestion: (sessionId: string, question: T) => boolean;
  countQueuedQuestions: (sessionId: string) => number;
  onError: (error: unknown) => void;
  minQueuedQuestions?: number;
};

export type QuestionQueueProvider = {
  initialize: (shouldIgnoreResult?: ShouldIgnoreResult) => Promise<void>;
  requestNextQuestion: (shouldIgnoreResult?: ShouldIgnoreResult) => Promise<void>;
  clear: () => void;
};

export function createQuestionQueueProvider<T>({
  sessionId,
  loadInitialQuestions,
  loadNextQuestions,
  pushLoadedQuestion,
  restoreCurrentQuestion,
  consumeNextQuestion,
  enqueueQuestion,
  countQueuedQuestions,
  onError,
  minQueuedQuestions = LOCAL_TEST_SESSION_MIN_QUEUED_QUESTIONS,
}: QuestionQueueProviderInput<T>): QuestionQueueProvider {
  let isReplenishing = false;
  let isDisposed = false;

  function applyLoadedQuestions(loadedQuestions: LoadedQuestions<T>): void {
    const applied = pushLoadedQuestion(loadedQuestions.question);
    if (!applied) {
      throw new Error("Failed to persist question in local session.");
    }

    enqueueQuestion(sessionId, loadedQuestions.nextQuestion);
  }

  function scheduleReplenish(shouldIgnoreResult?: ShouldIgnoreResult): void {
    void replenishQueue(shouldIgnoreResult);
  }

  async function initialize(
    shouldIgnoreResult?: ShouldIgnoreResult,
  ): Promise<void> {
    if (restoreCurrentQuestion?.()) {
      return;
    }

    try {
      const loadedQuestions = await loadInitialQuestions();
      if (isDisposed || shouldIgnoreResult?.()) {
        return;
      }

      applyLoadedQuestions(loadedQuestions);
    } catch (error) {
      if (isDisposed || shouldIgnoreResult?.()) {
        return;
      }

      onError(error);
    }
  }

  async function requestNextQuestion(
    shouldIgnoreResult?: ShouldIgnoreResult,
  ): Promise<void> {
    const consumed = consumeNextQuestion?.() ?? false;
    if (consumed && !shouldIgnoreResult?.()) {
      scheduleReplenish(shouldIgnoreResult);
    }
  }

  async function replenishQueue(
    shouldIgnoreResult?: ShouldIgnoreResult,
  ): Promise<void> {
    if (isDisposed || isReplenishing) {
      return;
    }

    isReplenishing = true;
    try {
      while (!isDisposed && !shouldIgnoreResult?.()) {
        const queuedCount = countQueuedQuestions(sessionId);
        if (queuedCount >= minQueuedQuestions) {
          return;
        }

        const loadedQuestions = await loadNextQuestions();
        if (isDisposed || shouldIgnoreResult?.()) {
          return;
        }

        const firstQueued = enqueueQuestion(
          sessionId,
          loadedQuestions.question,
        );
        const secondQueued = enqueueQuestion(
          sessionId,
          loadedQuestions.nextQuestion,
        );

        if (!firstQueued && !secondQueued) {
          return;
        }
      }
    } catch (error) {
      if (!shouldIgnoreResult?.()) {
        onError(error);
      }
    } finally {
      isReplenishing = false;
    }
  }

  function clear() {
    isDisposed = true;
    isReplenishing = false;
  }

  return {
    initialize,
    requestNextQuestion,
    clear,
  };
}
