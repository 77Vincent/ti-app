import { SUBJECTS } from "./subjects";
import { SUBCATEGORY_CATALOG } from "./subcategories";
import type { SubjectType } from "./subjects";
import type { SubcategoryOption } from "./subcategories";

export function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

export function getOrderedSubjects(): SubjectType[] {
  return sortByOrder<SubjectType>(SUBJECTS);
}

export function getSubjectById(subjectId: string): SubjectType | null {
  return getOrderedSubjects().find((subject) => subject.id === subjectId) ?? null;
}

export function getOrderedSubcategories(subjectId: string): SubcategoryOption[] {
  return sortByOrder(
    SUBCATEGORY_CATALOG.filter(
      (subcategory) => subcategory.subjectId === subjectId,
    ),
  );
}
