import { DIFFICULTIES } from "./difficulties";
import { SUBJECTS } from "./subjects";
import { SUBCATEGORIES } from "./subcategories";
import type { DifficultyEnum } from "./difficulties";
import type { SubjectEnum } from "./subjects";

export function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

const SUBJECT_LABEL_BY_ID: Record<SubjectEnum, string> = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, subject.label]),
) as Record<SubjectEnum, string>;

const DIFFICULTY_LABEL_BY_ID: Record<DifficultyEnum, string> = Object.fromEntries(
  DIFFICULTIES.map((difficulty) => [difficulty.id, difficulty.label]),
) as Record<DifficultyEnum, string>;

const SUBCATEGORY_LABEL_BY_ID: Record<string, string> = Object.fromEntries(
  SUBCATEGORIES.map((subcategory) => [subcategory.id, subcategory.label]),
) as Record<string, string>;

export function getSubjectLabel(id: SubjectEnum): string {
  return SUBJECT_LABEL_BY_ID[id];
}

export function getDifficultyLabel(id: DifficultyEnum): string {
  return DIFFICULTY_LABEL_BY_ID[id];
}

export function getSubcategoryLabel(id: string): string {
  return SUBCATEGORY_LABEL_BY_ID[id] ?? id;
}
