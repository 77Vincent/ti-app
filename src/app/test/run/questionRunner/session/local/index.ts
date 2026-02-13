import type { Question, QuestionOptionId } from "../../types";
import { parseLocalTestSessionSnapshotJson } from "./codec";
import {
  calculateLocalTestSessionAccuracy,
  initializeLocalTestSessionSnapshot,
  shiftLocalTestSessionSnapshotQuestion,
  toLocalTestSessionQuestionState,
  updateCurrentLocalTestSessionSnapshotQuestion,
  upsertLocalTestSessionSnapshotQuestion,
  type LocalTestSessionQuestionEntry,
  type LocalTestSessionAccuracy,
  type LocalTestSessionQuestionState,
  type LocalTestSessionSnapshot,
} from "./state";
import {
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} from "./store";

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
  writeLocalTestSessionRaw(JSON.stringify(snapshot));
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

export type LocalTestSessionProgress = LocalTestSessionAccuracy & {
  currentQuestionIndex: number;
};

export function readLocalTestSessionSnapshot(): LocalTestSessionSnapshot | null {
  const raw = readLocalTestSessionRaw();
  if (!raw) {
    return null;
  }

  return parseLocalTestSessionSnapshotJson(raw);
}

export function readLocalTestSessionQuestionState(
  sessionId: string,
): LocalTestSessionQuestionState | null {
  const snapshot = readSnapshotBySessionId(sessionId);
  if (!snapshot) {
    return null;
  }

  return toLocalTestSessionQuestionState(snapshot);
}

export function readLocalTestSessionAccuracy(
  sessionId: string,
): LocalTestSessionAccuracy | null {
  const snapshot = readSnapshotBySessionId(sessionId);
  if (!snapshot) {
    return null;
  }

  return calculateLocalTestSessionAccuracy(snapshot);
}

export function readLocalTestSessionProgress(
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

export function shiftLocalTestSessionQuestion(
  sessionId: string,
  step: -1 | 1,
): LocalTestSessionQuestionState | null {
  return mutateSnapshotForSession(sessionId, (snapshot) =>
    shiftLocalTestSessionSnapshotQuestion(snapshot, step),
  );
}

export function writeLocalTestSession(sessionId: string): void {
  const existing = readLocalTestSessionSnapshot();
  const nextSnapshot = initializeLocalTestSessionSnapshot(existing, sessionId);
  persistSnapshot(nextSnapshot);
}

export function writeLocalTestSessionQuestion(
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

export function writeLocalTestSessionQuestionSelection(
  sessionId: string,
  selectedOptionIds: QuestionOptionId[],
): LocalTestSessionQuestionState | null {
  return updateCurrentLocalTestSessionQuestion(sessionId, (questionEntry) => ({
    ...questionEntry,
    selectedOptionIds: [...selectedOptionIds],
  }));
}

export function markLocalTestSessionQuestionSubmitted(
  sessionId: string,
): LocalTestSessionQuestionState | null {
  return updateCurrentLocalTestSessionQuestion(sessionId, (questionEntry) => ({
    ...questionEntry,
    hasSubmitted: true,
  }));
}

export function clearLocalTestSession(): void {
  clearLocalTestSessionRaw();
}

export { calculateLocalTestSessionAccuracy } from "./state";
export type {
  LocalTestSessionAccuracy,
  LocalTestSessionQuestionEntry,
  LocalTestSessionQuestionState,
  LocalTestSessionSnapshot,
} from "./state";
