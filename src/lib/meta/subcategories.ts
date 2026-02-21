import type { SubjectEnum } from "./subjects";

export type SubcategoryEnum = "english";

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
];
