import { SUBJECT_CATALOG } from "./data";
import type { SubcategoryEntry, SubjectEntry } from "./types";

function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

function getEnabledEntries<T extends { disabled?: boolean }>(entries: T[]): T[] {
  return entries.filter((entry) => !entry.disabled);
}

export function getOrderedSubjects(): SubjectEntry[] {
  return sortByOrder(getEnabledEntries(SUBJECT_CATALOG));
}

export function getSubjectById(subjectId: string): SubjectEntry | null {
  return getOrderedSubjects().find((subject) => subject.id === subjectId) ?? null;
}

export function getOrderedSubcategories(subjectId: string): SubcategoryEntry[] {
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return [];
  }

  return sortByOrder(getEnabledEntries(subject.subcategories));
}
