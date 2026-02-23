import { SUBJECTS, SUBCATEGORIES } from "@/lib/meta";
import type {
  SubjectEnum,
  SubcategoryEnum,
} from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";

export type QuestionParam = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

export type TestParam = QuestionParam;

export type TestSession = TestParam & {
  id: string;
  correctCount: number;
  submittedCount: number;
};

export function parseQuestionParam(value: unknown): QuestionParam | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const subjectId = (value as { subjectId?: unknown }).subjectId;
  const subcategoryId = (value as { subcategoryId?: unknown }).subcategoryId;
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

  const difficulty = (value as { difficulty?: unknown }).difficulty;
  if (!isNonEmptyString(difficulty)) {
    return null;
  }

  return {
    subjectId: subjectId as SubjectEnum,
    subcategoryId: subcategoryId as SubcategoryEnum,
    difficulty: difficulty.trim(),
  };
}

export function parseTestParam(value: unknown): TestParam | null {
  return parseQuestionParam(value);
}

export function parseTestSession(value: unknown): TestSession | null {
  const params = parseTestParam(value);
  if (!params) {
    return null;
  }

  const id = (value as { id?: unknown }).id;
  if (!isNonEmptyString(id)) {
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
  };
}
