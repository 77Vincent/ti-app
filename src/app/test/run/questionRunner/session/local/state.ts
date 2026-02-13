import type { Question, QuestionOptionId } from "../../types";

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

export function shiftLocalTestSessionSnapshotQuestion(
  snapshot: LocalTestSessionSnapshot,
  step: -1 | 1,
): LocalTestSessionSnapshot | null {
  const nextIndex = snapshot.currentQuestionIndex + step;
  if (nextIndex < 0 || nextIndex >= snapshot.questions.length) {
    return null;
  }

  return {
    ...snapshot,
    currentQuestionIndex: nextIndex,
  };
}

export function updateCurrentLocalTestSessionSnapshotQuestion(
  snapshot: LocalTestSessionSnapshot,
  update: (
    questionEntry: LocalTestSessionQuestionEntry,
  ) => LocalTestSessionQuestionEntry,
): LocalTestSessionSnapshot | null {
  const currentQuestionEntry = snapshot.questions[snapshot.currentQuestionIndex];
  if (!currentQuestionEntry) {
    return null;
  }

  return {
    ...snapshot,
    questions: snapshot.questions.map((questionEntry, index) =>
      index === snapshot.currentQuestionIndex
        ? update(currentQuestionEntry)
        : questionEntry,
    ),
  };
}

export function upsertLocalTestSessionSnapshotQuestion(
  snapshot: LocalTestSessionSnapshot,
  question: Question,
): LocalTestSessionSnapshot {
  const existingQuestionIndex = snapshot.questions.findIndex(
    (item) => item.question.id === question.id,
  );
  const questions =
    existingQuestionIndex >= 0
      ? snapshot.questions.map((item, index) =>
          index === existingQuestionIndex
            ? {
                ...item,
                question,
              }
            : item,
        )
      : [
          ...snapshot.questions,
          {
            question,
            selectedOptionIds: [],
            hasSubmitted: false,
          },
        ];

  return {
    sessionId: snapshot.sessionId,
    questions,
    currentQuestionIndex:
      existingQuestionIndex >= 0
        ? existingQuestionIndex
        : questions.length - 1,
  };
}
