export type LoadAndApplyQuestionInput<T> = {
  load: () => Promise<T>;
  pushLoadedQuestion: (question: T) => boolean;
  onError: (error: unknown) => void;
  shouldIgnoreResult?: () => boolean;
};

export async function loadAndApplyQuestion<T>({
  load,
  pushLoadedQuestion,
  onError,
  shouldIgnoreResult,
}: LoadAndApplyQuestionInput<T>): Promise<void> {
  try {
    const question = await load();

    if (shouldIgnoreResult?.()) {
      return;
    }

    const applied = pushLoadedQuestion(question);
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
