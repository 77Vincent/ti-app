import { isNonEmptyString } from "@/lib/string";
import type {
  LocalTestSessionQuestionEntry,
  LocalTestSessionSnapshot,
} from "./state";

function parseLocalTestSessionQuestionEntry(
  payload: unknown,
): LocalTestSessionQuestionEntry | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as {
    question?: unknown;
    selectedOptionIds?: unknown;
    hasSubmitted?: unknown;
  };

  if (!raw.question || typeof raw.question !== "object") {
    return null;
  }

  if (!Array.isArray(raw.selectedOptionIds)) {
    return null;
  }

  if (!raw.selectedOptionIds.every((optionId) => isNonEmptyString(optionId))) {
    return null;
  }

  if (typeof raw.hasSubmitted !== "boolean") {
    return null;
  }

  return {
    question: raw.question as LocalTestSessionQuestionEntry["question"],
    selectedOptionIds:
      raw.selectedOptionIds as LocalTestSessionQuestionEntry["selectedOptionIds"],
    hasSubmitted: raw.hasSubmitted,
  };
}

export function parseLocalTestSessionSnapshot(
  payload: unknown,
): LocalTestSessionSnapshot | null {
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

  const questions: LocalTestSessionQuestionEntry[] = [];
  for (const questionEntry of raw.questions) {
    const parsedQuestionEntry = parseLocalTestSessionQuestionEntry(questionEntry);
    if (!parsedQuestionEntry) {
      return null;
    }
    questions.push(parsedQuestionEntry);
  }

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

export function parseLocalTestSessionSnapshotJson(
  raw: string,
): LocalTestSessionSnapshot | null {
  try {
    return parseLocalTestSessionSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}
