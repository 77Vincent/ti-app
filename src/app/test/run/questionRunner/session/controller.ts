export type QuestionSessionControllerInput<T> = {
  loadQuestion: () => Promise<T>;
};

export type QuestionSessionController<T> = {
  loadInitialQuestion: () => Promise<T>;
  consumeNextQuestion: () => Promise<T>;
  clear: () => void;
};

export function createQuestionSessionController<T>({
  loadQuestion,
}: QuestionSessionControllerInput<T>): QuestionSessionController<T> {
  async function loadInitialQuestion(): Promise<T> {
    return loadQuestion();
  }

  async function consumeNextQuestion(): Promise<T> {
    return loadQuestion();
  }

  function clear() {
    // No buffered state to clear.
  }

  return {
    loadInitialQuestion,
    consumeNextQuestion,
    clear,
  };
}
