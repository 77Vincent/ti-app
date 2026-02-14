import type { Question, QuestionOptionId } from "@/lib/validation/question";

export type LocalTestSessionSnapshot = {
  sessionId: string;
  questions: LocalTestSessionQuestionEntry[];
  currentQuestionIndex: number;
};

export type LocalTestSessionQuestionEntry = {
  question: Question;
  selectedOptionIds: QuestionOptionId[];
  hasSubmitted: boolean;
};

export type LocalTestSessionQuestionState = {
  question: Question;
  selectedOptionIds: QuestionOptionId[];
  hasSubmitted: boolean;
  currentQuestionIndex: number;
};

export type LocalTestSessionAccuracy = {
  submittedCount: number;
  correctCount: number;
};

export function toLocalTestSessionQuestionState(
  snapshot: LocalTestSessionSnapshot,
): LocalTestSessionQuestionState | null {
  const questionEntry = snapshot.questions[snapshot.currentQuestionIndex];
  if (!questionEntry) {
    return null;
  }

  return {
    question: questionEntry.question,
    selectedOptionIds: questionEntry.selectedOptionIds,
    hasSubmitted: questionEntry.hasSubmitted,
    currentQuestionIndex: snapshot.currentQuestionIndex,
  };
}

function isQuestionEntryCorrect(
  questionEntry: LocalTestSessionQuestionEntry,
): boolean {
  if (!questionEntry.hasSubmitted) {
    return false;
  }

  const { selectedOptionIds } = questionEntry;
  const { correctOptionIds } = questionEntry.question;

  if (selectedOptionIds.length !== correctOptionIds.length) {
    return false;
  }

  const selectedOptionIdSet = new Set(selectedOptionIds);
  if (selectedOptionIdSet.size !== selectedOptionIds.length) {
    return false;
  }

  return correctOptionIds.every((optionId) =>
    selectedOptionIdSet.has(optionId),
  );
}

export function calculateLocalTestSessionAccuracy(
  snapshot: LocalTestSessionSnapshot,
): LocalTestSessionAccuracy {
  const submittedQuestions = snapshot.questions.filter(
    (questionEntry) => questionEntry.hasSubmitted,
  );
  const submittedCount = submittedQuestions.length;
  const correctCount = submittedQuestions.filter(isQuestionEntryCorrect).length;

  return {
    submittedCount,
    correctCount,
  };
}

export function initializeLocalTestSessionSnapshot(
  existing: LocalTestSessionSnapshot | null,
  sessionId: string,
): LocalTestSessionSnapshot {
  const shouldKeepExistingState =
    existing !== null && existing.sessionId === sessionId;

  return {
    sessionId,
    questions: shouldKeepExistingState ? existing.questions : [],
    currentQuestionIndex: shouldKeepExistingState
      ? existing.currentQuestionIndex
      : 0,
  };
}
