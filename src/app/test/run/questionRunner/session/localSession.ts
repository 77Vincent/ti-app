import type { Question } from "../types";
import { isNonEmptyString } from "@/lib/string";

const TEST_SESSION_LOCAL_STORAGE_KEY = "ti-app-test-session";

export type LocalTestSessionSnapshot = {
  sessionId: string;
  questions: Question[];
  currentQuestionIndex: number;
};

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseLocalTestSessionSnapshot(payload: unknown): LocalTestSessionSnapshot | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as {
    sessionId?: unknown;
    questions?: unknown;
    currentQuestionIndex?: unknown;
  };

  if (!isNonEmptyString(raw.sessionId)) {
    return null;
  }

  if (!Array.isArray(raw.questions)) {
    return null;
  }

  if (
    typeof raw.currentQuestionIndex !== "number" ||
    !Number.isFinite(raw.currentQuestionIndex)
  ) {
    return null;
  }

  const questions = raw.questions as Question[];
  const currentQuestionIndex = Math.floor(raw.currentQuestionIndex);
  const maxQuestionIndex = questions.length > 0 ? questions.length - 1 : 0;

  if (currentQuestionIndex < 0 || currentQuestionIndex > maxQuestionIndex) {
    return null;
  }

  return {
    sessionId: raw.sessionId,
    questions,
    currentQuestionIndex,
  };
}

export function readLocalTestSessionSnapshot(): LocalTestSessionSnapshot | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(TEST_SESSION_LOCAL_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return parseLocalTestSessionSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}

function persistLocalTestSessionState(state: LocalTestSessionSnapshot): void {
  window.localStorage.setItem(
    TEST_SESSION_LOCAL_STORAGE_KEY,
    JSON.stringify(state),
  );
}

export function writeLocalTestSession(sessionId: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const existing = readLocalTestSessionSnapshot();
    const shouldKeepExistingState =
      existing !== null && existing.sessionId === sessionId;

    persistLocalTestSessionState({
      sessionId,
      questions: shouldKeepExistingState ? existing.questions : [],
      currentQuestionIndex: shouldKeepExistingState
        ? existing.currentQuestionIndex
        : 0,
    });
  } catch {
    // Ignore storage write failures.
  }
}

export function writeLocalTestSessionQuestion(question: Question): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const existing = readLocalTestSessionSnapshot();
    if (!existing) {
      return;
    }

    const existingQuestionIndex = existing.questions.findIndex(
      (item) => item.id === question.id,
    );
    const questions =
      existingQuestionIndex >= 0
        ? existing.questions.map((item, index) =>
            index === existingQuestionIndex ? question : item,
          )
        : [...existing.questions, question];
    const currentQuestionIndex =
      existingQuestionIndex >= 0
        ? existingQuestionIndex
        : questions.length - 1;

    persistLocalTestSessionState({
      sessionId: existing.sessionId,
      questions,
      currentQuestionIndex,
    });
  } catch {
    // Ignore storage write failures.
  }
}

export function clearLocalTestSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(TEST_SESSION_LOCAL_STORAGE_KEY);
  } catch {
    // Ignore storage clear failures.
  }
}
