import {
  clearAsyncBuffer,
  consumeAsyncBuffer,
  createAsyncBuffer,
  fillAsyncBuffer,
} from "@/lib/asyncBuffer";

export type QuestionSessionControllerInput<T> = {
  bufferSize: number;
  loadQuestion: () => Promise<T>;
};

export type QuestionSessionController<T> = {
  loadInitialQuestion: () => Promise<T>;
  consumeNextQuestion: () => Promise<T>;
  prefetchToCapacity: () => Promise<void>;
  clear: () => void;
  hasBufferedQuestion: () => boolean;
  getBufferedCount: () => number;
};

export function createQuestionSessionController<T>({
  bufferSize,
  loadQuestion,
}: QuestionSessionControllerInput<T>): QuestionSessionController<T> {
  const buffer = createAsyncBuffer<T>(bufferSize);

  async function prefetchToCapacity() {
    try {
      await fillAsyncBuffer(buffer, loadQuestion);
    } catch {
      // Silent prefetch failure: consumer still has direct fetch fallback.
    }
  }

  function prefetchInBackground() {
    void prefetchToCapacity();
  }

  async function loadInitialQuestion(): Promise<T> {
    clearAsyncBuffer(buffer);
    const nextQuestion = await loadQuestion();
    prefetchInBackground();
    return nextQuestion;
  }

  async function consumeNextQuestion(): Promise<T> {
    const bufferedQuestion = consumeAsyncBuffer(buffer);

    if (bufferedQuestion) {
      prefetchInBackground();
      return bufferedQuestion;
    }

    const nextQuestion = await loadQuestion();
    prefetchInBackground();
    return nextQuestion;
  }

  function clear() {
    clearAsyncBuffer(buffer);
  }

  function hasBufferedQuestion(): boolean {
    return buffer.items.length > 0;
  }

  function getBufferedCount(): number {
    return buffer.items.length;
  }

  return {
    loadInitialQuestion,
    consumeNextQuestion,
    prefetchToCapacity,
    clear,
    hasBufferedQuestion,
    getBufferedCount,
  };
}
