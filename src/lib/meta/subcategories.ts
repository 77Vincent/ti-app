import type { SubjectEnum } from "./subjects";

export type SubcategoryEnum =
  | "english"
  | "chinese"
  | "japanese";

export type SubcategoryOption = {
  id: SubcategoryEnum;
  label: string;
  subjectId: SubjectEnum;
  order: number;
};

export const SUBCATEGORIES: SubcategoryOption[] = [
  {
    id: "english",
    label: "English",
    subjectId: "language",
    order: 1,
  },
  {
    id: "chinese",
    label: "Chinese",
    subjectId: "language",
    order: 2,
  },
  {
    id: "japanese",
    label: "Japanese",
    subjectId: "language",
    order: 3,
  },
];
