import type { Question } from "@/lib/question/model";
import type {
  LocalTestSessionQuestionEntry,
  LocalTestSessionSnapshot,
} from "./model";

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
  const currentQuestionEntry = snapshot.questions[snapshot.currentQuestionIndex];
  if (currentQuestionEntry?.hasSubmitted) {
    const nextQuestions = [
      ...snapshot.questions,
      {
        question,
        selectedOptionIds: [],
        hasSubmitted: false,
      },
    ];

    return {
      sessionId: snapshot.sessionId,
      questions: nextQuestions,
      currentQuestionIndex: nextQuestions.length - 1,
    };
  }

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
