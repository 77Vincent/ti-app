import {
  DIFFICULTIES,
  SUBJECTS,
  SUBCATEGORIES,
} from "@/lib/meta";
import type { DifficultyEnum } from "@/lib/meta";

export const TEST_SESSION_STORAGE_KEY = "ti-app:test-session";
const TEST_SESSION_CHANGE_EVENT = "ti-app:test-session:change";

export type TestRunParams = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyEnum;
};

type StoredTestSession = TestRunParams & {
  questionIndex: number;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseStoredSession(rawSession: string | null): StoredTestSession | null {
  if (!rawSession) {
    return null;
  }

  try {
    const value = JSON.parse(rawSession) as Partial<StoredTestSession>;

    const subjectId = value.subjectId;
    const subcategoryId = value.subcategoryId;
    const difficulty = value.difficulty;
    const questionIndex = value.questionIndex;

    if (
      !isNonEmptyString(subjectId) ||
      !isNonEmptyString(subcategoryId) ||
      !isNonEmptyString(difficulty) ||
      typeof questionIndex !== "number" ||
      !Number.isInteger(questionIndex) ||
      questionIndex < 0
    ) {
      return null;
    }

    const isValidDifficulty = DIFFICULTIES.some(
      (item) => item.id === difficulty,
    );
    const isValidSubject = SUBJECTS.some((item) => item.id === subjectId);
    const isValidSubcategory = SUBCATEGORIES.some(
      (item) => item.id === subcategoryId && item.subjectId === subjectId,
    );

    if (!isValidDifficulty || !isValidSubject || !isValidSubcategory) {
      return null;
    }

    return {
      subjectId,
      subcategoryId,
      difficulty: difficulty as DifficultyEnum,
      questionIndex,
    };
  } catch {
    return null;
  }
}

export function parseStoredTestSession(rawSession: string | null): TestRunParams | null {
  const session = parseStoredSession(rawSession);

  if (!session) {
    return null;
  }

  return {
    subjectId: session.subjectId,
    subcategoryId: session.subcategoryId,
    difficulty: session.difficulty,
  };
}

export function getStoredQuestionIndex(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const session = parseStoredSession(
    sessionStorage.getItem(TEST_SESSION_STORAGE_KEY),
  );

  return session?.questionIndex ?? null;
}

function emitTestSessionChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(TEST_SESSION_CHANGE_EVENT));
}

export function subscribeStoredTestSession(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === TEST_SESSION_STORAGE_KEY) {
      onStoreChange();
    }
  };

  window.addEventListener(TEST_SESSION_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(TEST_SESSION_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function updateStoredQuestionIndex(nextQuestionIndex: number): void {
  if (
    typeof window === "undefined" ||
    !Number.isInteger(nextQuestionIndex) ||
    nextQuestionIndex < 0
  ) {
    return;
  }

  const rawSession = sessionStorage.getItem(TEST_SESSION_STORAGE_KEY);
  const session = parseStoredSession(rawSession);

  if (!session) {
    return;
  }

  sessionStorage.setItem(
    TEST_SESSION_STORAGE_KEY,
    JSON.stringify({
      ...session,
      questionIndex: nextQuestionIndex,
    }),
  );
  emitTestSessionChange();
}

export function clearStoredTestSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(TEST_SESSION_STORAGE_KEY);
  emitTestSessionChange();
}
