import type { Question } from "../types";

const CURRENT_QUESTION_CACHE_KEY = "ti-app-current-question";

type CachedQuestionPayload = {
  question: Question;
  sessionKey: string;
};

function canUseSessionStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.sessionStorage !== "undefined"
  );
}

export function readCachedQuestion(sessionKey: string): Question | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CURRENT_QUESTION_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as Partial<CachedQuestionPayload>;
    if (payload.sessionKey !== sessionKey || !payload.question) {
      return null;
    }

    return payload.question;
  } catch {
    return null;
  }
}

export function writeCachedQuestion(sessionKey: string, question: Question): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    const payload: CachedQuestionPayload = {
      question,
      sessionKey,
    };

    window.sessionStorage.setItem(
      CURRENT_QUESTION_CACHE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage write failures.
  }
}

export function clearCachedQuestion(): void {
  if (!canUseSessionStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(CURRENT_QUESTION_CACHE_KEY);
  } catch {
    // Ignore storage clear failures.
  }
}
