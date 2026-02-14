import { parseLocalTestSessionSnapshotJson } from "@/lib/testSession/codec/snapshot";
import {
  consumeLocalTestSessionSnapshotQueuedQuestion,
  countLocalTestSessionSnapshotQueuedQuestions,
  enqueueLocalTestSessionSnapshotQuestion,
  shiftLocalTestSessionSnapshotQuestion,
  updateCurrentLocalTestSessionSnapshotQuestion,
  upsertLocalTestSessionSnapshotQuestion,
  calculateLocalTestSessionAccuracy,
  initializeLocalTestSessionSnapshot,
  toLocalTestSessionQuestionState,
  type LocalTestSessionQuestionEntry,
  type LocalTestSessionAccuracy,
  type LocalTestSessionQuestionState,
  type LocalTestSessionSnapshot,
} from "@/lib/testSession/core";
import type { Question, QuestionOptionId } from "@/lib/question/model";

export type LocalTestSessionProgress = LocalTestSessionAccuracy & {
  currentQuestionIndex: number;
};

type LocalTestSessionStorageAdapter = {
  clearRaw: () => void;
  readRaw: () => string | null;
  writeRaw: (raw: string) => void;
};

export function createLocalTestSessionService(
  storage: LocalTestSessionStorageAdapter,
) {
  function readLocalTestSessionSnapshot(): LocalTestSessionSnapshot | null {
    const raw = storage.readRaw();
    if (!raw) {
      return null;
    }

    return parseLocalTestSessionSnapshotJson(raw);
  }

  function readSnapshotBySessionId(
    sessionId: string,
  ): LocalTestSessionSnapshot | null {
    const snapshot = readLocalTestSessionSnapshot();
    if (!snapshot || snapshot.sessionId !== sessionId) {
      return null;
    }

    return snapshot;
  }

  function persistSnapshot(snapshot: LocalTestSessionSnapshot): void {
    storage.writeRaw(JSON.stringify(snapshot));
  }

  function mutateSnapshotForSession(
    sessionId: string,
    mutate: (
      snapshot: LocalTestSessionSnapshot,
    ) => LocalTestSessionSnapshot | null,
  ): LocalTestSessionQuestionState | null {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return null;
    }

    const nextSnapshot = mutate(snapshot);
    if (!nextSnapshot) {
      return null;
    }

    persistSnapshot(nextSnapshot);
    return toLocalTestSessionQuestionState(nextSnapshot);
  }

  function updateCurrentLocalTestSessionQuestion(
    sessionId: string,
    update: (
      questionEntry: LocalTestSessionQuestionEntry,
    ) => LocalTestSessionQuestionEntry,
  ): LocalTestSessionQuestionState | null {
    return mutateSnapshotForSession(sessionId, (snapshot) =>
      updateCurrentLocalTestSessionSnapshotQuestion(snapshot, update),
    );
  }

  function readLocalTestSessionQuestionState(
    sessionId: string,
  ): LocalTestSessionQuestionState | null {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return null;
    }

    return toLocalTestSessionQuestionState(snapshot);
  }

  function readLocalTestSessionAccuracy(
    sessionId: string,
  ): LocalTestSessionAccuracy | null {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return null;
    }

    return calculateLocalTestSessionAccuracy(snapshot);
  }

  function readLocalTestSessionProgress(
    sessionId: string,
  ): LocalTestSessionProgress | null {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return null;
    }

    return {
      currentQuestionIndex: snapshot.currentQuestionIndex,
      ...calculateLocalTestSessionAccuracy(snapshot),
    };
  }

  function countLocalTestSessionQueuedQuestions(sessionId: string): number {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return 0;
    }

    return countLocalTestSessionSnapshotQueuedQuestions(snapshot);
  }

  function shiftLocalTestSessionQuestion(
    sessionId: string,
    step: -1 | 1,
  ): LocalTestSessionQuestionState | null {
    return mutateSnapshotForSession(sessionId, (snapshot) =>
      shiftLocalTestSessionSnapshotQuestion(snapshot, step),
    );
  }

  function writeLocalTestSession(sessionId: string): void {
    const existing = readLocalTestSessionSnapshot();
    const nextSnapshot = initializeLocalTestSessionSnapshot(existing, sessionId);
    persistSnapshot(nextSnapshot);
  }

  function writeLocalTestSessionQuestion(
    question: Question,
  ): LocalTestSessionQuestionState | null {
    const snapshot = readLocalTestSessionSnapshot();
    if (!snapshot) {
      return null;
    }

    const nextSnapshot = upsertLocalTestSessionSnapshotQuestion(snapshot, question);
    persistSnapshot(nextSnapshot);
    return toLocalTestSessionQuestionState(nextSnapshot);
  }

  function enqueueLocalTestSessionQuestion(
    sessionId: string,
    question: Question,
  ): boolean {
    const snapshot = readSnapshotBySessionId(sessionId);
    if (!snapshot) {
      return false;
    }

    const nextSnapshot = enqueueLocalTestSessionSnapshotQuestion(snapshot, question);
    persistSnapshot(nextSnapshot);
    return true;
  }

  function consumeLocalTestSessionQueuedQuestion(
    sessionId: string,
  ): LocalTestSessionQuestionState | null {
    return mutateSnapshotForSession(sessionId, (snapshot) =>
      consumeLocalTestSessionSnapshotQueuedQuestion(snapshot),
    );
  }

  function writeLocalTestSessionQuestionSelection(
    sessionId: string,
    selectedOptionIds: QuestionOptionId[],
  ): LocalTestSessionQuestionState | null {
    return updateCurrentLocalTestSessionQuestion(sessionId, (questionEntry) => ({
      ...questionEntry,
      selectedOptionIds: [...selectedOptionIds],
    }));
  }

  function markLocalTestSessionQuestionSubmitted(
    sessionId: string,
  ): LocalTestSessionQuestionState | null {
    return updateCurrentLocalTestSessionQuestion(sessionId, (questionEntry) => ({
      ...questionEntry,
      hasSubmitted: true,
    }));
  }

  function clearLocalTestSession(): void {
    storage.clearRaw();
  }

  return {
    clearLocalTestSession,
    consumeLocalTestSessionQueuedQuestion,
    countLocalTestSessionQueuedQuestions,
    markLocalTestSessionQuestionSubmitted,
    readLocalTestSessionAccuracy,
    readLocalTestSessionProgress,
    readLocalTestSessionQuestionState,
    readLocalTestSessionSnapshot,
    shiftLocalTestSessionQuestion,
    writeLocalTestSession,
    writeLocalTestSessionQuestion,
    writeLocalTestSessionQuestionSelection,
    enqueueLocalTestSessionQuestion,
  };
}
