export type SubjectOption = {
  id: string;
  label: string;
};

export type SubcategoryOption = {
  id: string;
  label: string;
};

type SubjectCatalogEntry = SubjectOption & {
  subcategories: SubcategoryOption[];
};

const SUBJECT_CATALOG: SubjectCatalogEntry[] = [
  {
    id: "language",
    label: "Language",
    subcategories: [
      {
        id: "english",
        label: "English",
      },
    ],
  },
];

export const DEFAULT_SUBJECT_ID = SUBJECT_CATALOG[0]?.id ?? "";

export function getSubjectOptions(): SubjectOption[] {
  return SUBJECT_CATALOG.map(({ id, label }) => ({ id, label }));
}

export function getSubcategoryOptions(
  subjectId: string,
): SubcategoryOption[] {
  const matchedSubject = SUBJECT_CATALOG.find((subject) => subject.id === subjectId);
  return matchedSubject?.subcategories ?? [];
}

export function getDefaultSubcategoryId(subjectId: string): string {
  return getSubcategoryOptions(subjectId)[0]?.id ?? "";
}
