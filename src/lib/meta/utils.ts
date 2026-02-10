import { SUBJECT_CATALOG } from "./subjects";
import { SUBCATEGORY_CATALOG } from "./subcategories";
import type { SubcategoryEntry, SubjectEntry } from "./types";

export function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

export function getOrderedSubjects(): SubjectEntry[] {
  return sortByOrder<SubjectEntry>(SUBJECT_CATALOG);
}

export function getSubjectById(subjectId: string): SubjectEntry | null {
  return getOrderedSubjects().find((subject) => subject.id === subjectId) ?? null;
}

export function getOrderedSubcategories(subjectId: string): SubcategoryEntry[] {
  return sortByOrder(
    SUBCATEGORY_CATALOG.filter(
      (subcategory) => subcategory.subjectId === subjectId,
    ),
  );
}
