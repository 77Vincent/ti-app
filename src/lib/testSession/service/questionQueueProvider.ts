import { LOCAL_TEST_SESSION_MIN_QUEUED_QUESTIONS } from "@/lib/config/testPolicy";

export type LoadedQuestions<T> = {
  question: T;
  nextQuestion: T;
};

type LoadQuestions<T> = () => Promise<LoadedQuestions<T>>;
type ShouldIgnoreResult = () => boolean;

export type QuestionQueueProviderInput<T> = {
  sessionId: string;
  loadQuestions: LoadQuestions<T>;
  enqueueQuestion: (sessionId: string, question: T) => boolean;
  countQueuedQuestions: (sessionId: string) => number;
  onError: (error: unknown) => void;
  minQueuedQuestions?: number;
};

export type QuestionQueueProvider = {
  onQuestionConsumed: (shouldIgnoreResult?: ShouldIgnoreResult) => Promise<void>;
  clear: () => void;
};

export function createQuestionQueueProvider<T>({
  sessionId,
  loadQuestions,
  enqueueQuestion,
  countQueuedQuestions,
  onError,
  minQueuedQuestions = LOCAL_TEST_SESSION_MIN_QUEUED_QUESTIONS,
}: QuestionQueueProviderInput<T>): QuestionQueueProvider {
  let isReplenishing = false;
  let isDisposed = false;

  async function onQuestionConsumed(
    shouldIgnoreResult?: ShouldIgnoreResult,
  ): Promise<void> {
    if (!shouldIgnoreResult?.()) {
      void replenishQueue(shouldIgnoreResult);
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
      if (shouldIgnoreResult?.()) {
        return;
      }

      const queuedCount = countQueuedQuestions(sessionId);
      if (queuedCount >= minQueuedQuestions) {
        return;
      }

      const loadedQuestions = await loadQuestions();
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
    onQuestionConsumed,
    clear,
  };
}
