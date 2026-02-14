import { LOCAL_TEST_SESSION_MAX_QUEUED_QUESTIONS } from "@/lib/config/testPolicy";
import type { Question } from "@/lib/question/validation";
import type { LocalTestSessionSnapshot } from "./model";
import { shiftLocalTestSessionSnapshotQuestion } from "./history";

export function countLocalTestSessionSnapshotQueuedQuestions(
  snapshot: LocalTestSessionSnapshot,
): number {
  return Math.max(0, snapshot.questions.length - snapshot.currentQuestionIndex - 1);
}

export function enqueueLocalTestSessionSnapshotQuestion(
  snapshot: LocalTestSessionSnapshot,
  question: Question,
  maxQueuedQuestions = LOCAL_TEST_SESSION_MAX_QUEUED_QUESTIONS,
): LocalTestSessionSnapshot {
  if (snapshot.questions.some((entry) => entry.question.id === question.id)) {
    return snapshot;
  }

  if (countLocalTestSessionSnapshotQueuedQuestions(snapshot) >= maxQueuedQuestions) {
    return snapshot;
  }

  return {
    ...snapshot,
    questions: [
      ...snapshot.questions,
      {
        question,
        selectedOptionIds: [],
        hasSubmitted: false,
      },
    ],
  };
}

export function consumeLocalTestSessionSnapshotQueuedQuestion(
  snapshot: LocalTestSessionSnapshot,
): LocalTestSessionSnapshot | null {
  return shiftLocalTestSessionSnapshotQuestion(snapshot, 1);
}
