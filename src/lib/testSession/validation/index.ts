import { SUBJECTS, SUBCATEGORIES } from "@/lib/meta";
import type {
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";

export type QuestionParam = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
};

export type TestParam = QuestionParam;

export type TestSession = TestParam & {
  id: string;
  correctCount: number;
  submittedCount: number;
  startedAtMs: number;
};

export function parseQuestionParam(value: unknown): QuestionParam | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Partial<QuestionParam>;
  const subjectId = raw.subjectId;
  const subcategoryId = raw.subcategoryId;

  if (
    !isNonEmptyString(subjectId) ||
    !isNonEmptyString(subcategoryId)
  ) {
    return null;
  }

  const isValidSubject = SUBJECTS.some((item) => item.id === subjectId);
  const isValidSubcategory = SUBCATEGORIES.some(
    (item) => item.id === subcategoryId && item.subjectId === subjectId,
  );

  if (!isValidSubject || !isValidSubcategory) {
    return null;
  }

  const parsedSubjectId = subjectId as SubjectEnum;
  const parsedSubcategoryId = subcategoryId as SubcategoryEnum;

  return {
    subjectId: parsedSubjectId,
    subcategoryId: parsedSubcategoryId,
  };
}

export function parseTestParam(value: unknown): TestParam | null {
  return parseQuestionParam(value);
}

export function parseTestSession(value: unknown): TestSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const params = parseTestParam(value);
  if (!params) {
    return null;
  }

  const id = (value as { id?: unknown }).id;
  if (!isNonEmptyString(id)) {
    return null;
  }

  const startedAtMs = (value as { startedAtMs?: unknown }).startedAtMs;
  if (
    typeof startedAtMs !== "number" ||
    !Number.isFinite(startedAtMs) ||
    startedAtMs <= 0
  ) {
    return null;
  }

  const correctCount = (value as { correctCount?: unknown }).correctCount;
  if (
    typeof correctCount !== "number" ||
    !Number.isFinite(correctCount) ||
    correctCount < 0
  ) {
    return null;
  }

  const submittedCount = (value as { submittedCount?: unknown }).submittedCount;
  if (
    typeof submittedCount !== "number" ||
    !Number.isFinite(submittedCount) ||
    submittedCount < 0
  ) {
    return null;
  }

  return {
    ...params,
    id,
    correctCount: Math.floor(correctCount),
    submittedCount: Math.floor(submittedCount),
    startedAtMs: Math.floor(startedAtMs),
  };
}
